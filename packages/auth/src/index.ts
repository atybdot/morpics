import { env } from "cloudflare:workers";
import {
  checkout,
  dodopayments,
  portal,
  webhooks,
} from "@dodopayments/better-auth";
import { db } from "@morpics/db";
import { drizzle } from "@morpics/db/dirzzle";
import { getOrgOwner } from "@morpics/db/helpers/index";
import { usageHelpers } from "@morpics/db/helpers/usage";
import * as schema from "@morpics/db/schema/auth";
import { PRICING_TABLE, type UserTier } from "@morpics/db/schema/constants";
import { BetterAuthError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  apiKey,
  customSession,
  lastLoginMethod,
  multiSession,
  oAuthProxy,
  organization,
} from "better-auth/plugins";
import DodoPayments from "dodopayments";
export const dodoPayments = new DodoPayments({
  bearerToken: env.DODO_PAYMENTS_API_KEY,
  environment: env.NODE_ENV === "production" ? "live_mode" : "test_mode",
});
export const auth = betterAuth({
  appName: "morpics",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  logger: {
    level: "debug",
    disabled: false,
  },
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    oAuthProxy({
      currentURL: env.BETTER_AUTH_URL,
      productionURL: env.BETTER_AUTH_URL,
    }),
    customSession(async ({ user }) => {
      const [activeTier, usage, session] = await Promise.all([
        db.query.user.findFirst({
          where: (f, o) => o.eq(f.id, user.id),
          columns: { activeTier: true },
        }),
        db.query.usage.findFirst({
          where: (f, o) => o.eq(f.userId, user.id),
        }),
        db.query.session.findFirst({
          where: (f, o) =>
            o.and(o.eq(f.userId, user.id), o.gte(f.expiresAt, new Date())),
          orderBy: (f, o) => o.desc(f.createdAt),
        }),
      ]);
      const activeOrg = await db.query.organization.findFirst({
        where: (f, o) => o.eq(f.id, session?.activeOrganizationId ?? ""),
      });
      return { user: { ...user, ...activeTier }, session, usage, activeOrg };
    }),
    organization({
      allowUserToCreateOrganization: async (user) => {
        const userTier = (user.activeTier ??
          "free") as keyof typeof PRICING_TABLE;
        return await usageHelpers.canUse({
          userId: user.id,
          metric: "buckets",
          userTier,
        });
      },
      organizationHooks: {
        afterCreateOrganization: async ({ user, organization }) => {
          await Promise.all([
            usageHelpers.incrementMetric({
              userId: user.id,
              metric: "buckets",
            }),
            usageHelpers.incrementMetric({
              userId: user.id,
              metric: "seats",
              orgId: organization.id,
            }),
          ]);
        },

        beforeCreateInvitation: async (data) => {
          const owner = await getOrgOwner(data.organization.id).catch((err) => {
            if (err instanceof Error) {
              throw new BetterAuthError(err.message);
            }
            throw new BetterAuthError("unable to retrieve owner details");
          });

          const ownerActiveTier = owner?.user?.activeTier ?? "free";

          const canAddMember = await usageHelpers.checkOrgSeatsLimit({
            userId: owner?.user?.id ?? "",
            orgId: data.organization.id,
            userTier: ownerActiveTier,
          });

          if (!canAddMember) {
            throw new BetterAuthError(
              `Your ${ownerActiveTier} plan only allows up to ${PRICING_TABLE[ownerActiveTier].package.seats.allowed} members per organization. Please upgrade to add more.`,
            );
          }
        },
        // beforeAddMember: async (data) => {
        //   const owner = await getOrgOwner(
        //     data.member.organizationId,
        //     data.user.id,
        //   ).catch((err) => {
        //     if (err instanceof Error) {
        //       throw new BetterAuthError(err.message);
        //     }
        //     throw new BetterAuthError("unable to retrieve owner details");
        //   });

        //   const ownerActiveTier = owner?.user?.activeTier ?? "free";
        //   // Check if owner can add more members to this org
        //   const canAddMember = await usageHelpers.checkOrgSeatsLimit({
        //     userId: owner.user.id,
        //     orgId: data.organization.id,
        //     userTier: ownerActiveTier,
        //   });

        //   if (!canAddMember) {
        //     throw new BetterAuthError(
        //       `Your ${ownerActiveTier} plan only allows up to ${PRICING_TABLE[ownerActiveTier].package.seats.allowed} members per organization. Please upgrade to add more.`,
        //     );
        //   }
        // },
        afterAddMember: async (data) => {
          const owner = await getOrgOwner(data.organization.id).catch((err) => {
            if (err instanceof Error) {
              throw new BetterAuthError(err.message);
            }
            throw new BetterAuthError("unable to retrieve owner details");
          });
          await usageHelpers.incrementMetric({
            userId: owner?.user?.id ?? "",
            metric: "seats",
            orgId: data.organization.id,
          });
        },
      },
    }),
    multiSession(),
    lastLoginMethod({ storeInDatabase: true }),
    apiKey(),
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: PRICING_TABLE.pro.id,
              slug: "pro",
            },
            { productId: PRICING_TABLE.starter.id, slug: "starter" },
          ],
          successUrl: "/success",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          webhookKey: env.DODO_PAYMENTS_WEBHOOK_SECRET,
          // #TODO when planChange/expire notify users if they are using more than allocated resources, like overflow of storage cache bandwidth etc...
          // # TODO better move to metered billing in dodpayments
          onPayload: async (payload) => {
            const hasReferenceId = (
              d: unknown,
            ): d is { metadata?: { referenceId?: string } } =>
              typeof d === "object" && d !== null && "metadata" in d;

            const referenceId = hasReferenceId(payload.data)
              ? payload.data.metadata?.referenceId
              : "";

            if (!referenceId) {
              console.error(
                "[WEBHOOK] Missing referenceId in payload:",
                payload.type,
              );
              return;
            }

            const tier = (Object.entries(PRICING_TABLE).find(
              //@ts-expect-error it will be there when webhook is received
              ([_, t]) => t.id === payload.data?.product_id,
            )?.[0] ?? "free") as UserTier;

            switch (payload.type) {
              case "subscription.active":
              case "subscription.renewed": {
                await db
                  .update(schema.user)
                  .set({ activeTier: tier })
                  .where(drizzle.eq(schema.user.id, referenceId));
                break;
              }
              case "subscription.expired":
              case "subscription.on_hold":
              case "refund.succeeded": {
                await db
                  .update(schema.user)
                  .set({ activeTier: "free" })
                  .where(drizzle.eq(schema.user.id, referenceId));
                break;
              }
              case "subscription.plan_changed": {
                const new_tier = (Object.entries(PRICING_TABLE).find(
                  ([_, t]) => t.id === payload.data?.product_id,
                )?.[0] ?? "free") as UserTier;
                await db
                  .update(schema.user)
                  .set({ activeTier: new_tier })
                  .where(drizzle.eq(schema.user.id, referenceId));
                break;
              }
            }
          },
        }),
      ],
    }),
  ],
  // secondaryStorage: {
  //   get: async (key: string) => await env.AUTH_KV.get(key),
  //   set: async (key: string, value: string, ttl?: number) => {
  //     if (ttl) await env.AUTH_KV.put(key, value, { expirationTtl: ttl });
  //     else await env.AUTH_KV.put(key, value);
  //   },
  //   delete: async (key: string) => await env.AUTH_KV.delete(key),
  // },
  rateLimit: {
    enabled: true,
    window: 60,
    maxRequests: 500,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  advanced: {
    cookiePrefix: "morpics",
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: ".mor.pics",
    },
  },
  trustedOrigins: [
    env.BACKEND_URL,
    env.FRONTEND_URL,
    "http://localhost:3001",
    "http://localhost:3002",
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              activeTier: "free",
            },
          };
        },
        after: async (user) => {
          try {
            // Initialize usage record for new user
            await usageHelpers.getUsage(user.id);
          } catch (error) {
            console.error(
              "[ERROR] Failed to create usage record for user:",
              user.id,
              error,
            );
          }
        },
      },
    },
    session: {
      create: {
        before: async (useSession) => {
          const activeOrg = await db.query.member.findFirst({
            where: (fields, operators) =>
              operators.eq(fields.userId, useSession.userId),
            orderBy: (fields, operators) => operators.desc(fields.createdAt),
            columns: { organizationId: true },
          });
          if (activeOrg?.organizationId !== undefined) {
            return {
              data: {
                ...useSession,
                activeOrganizationId: activeOrg.organizationId,
              },
            };
          }
          return { data: { ...useSession } };
        },
      },
    },
  },
});
