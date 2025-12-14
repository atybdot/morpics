import { env } from "cloudflare:workers";
import { db } from "@morpics/db";
import * as schema from "@morpics/db/schema/auth";
import {
  BetterAuthError,
  type BetterAuthOptions,
  betterAuth,
} from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  apiKey,
  lastLoginMethod,
  multiSession,
  oAuthProxy,
  organization,
} from "better-auth/plugins";
import DodoPayments from "dodopayments";
import {
  checkout,
  dodopayments,
  portal,
  webhooks,
} from "@dodopayments/better-auth";
export const dodoPayments = new DodoPayments({
  bearerToken: env.DODO_PAYMENTS_API_KEY,
  environment: "test_mode", // or "live_mode" for production
});
export const auth = betterAuth<BetterAuthOptions>({
  appName: "morpics",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  plugins: [
    organization(),
    multiSession(),
    lastLoginMethod({ storeInDatabase: true }),
    apiKey(),
    oAuthProxy(),
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "pdt_iCxFJZdCmRysteABIDBTf",
              slug: "stater",
            },
            { productId: "pdt_tvgrl7Wwim1aNHlrUNJQi", slug: "teams" },
          ],
          successUrl: "/success",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          webhookKey: env.DODO_PAYMENTS_WEBHOOK_SECRET,
          onPayload: async (payload) => {
            console.log("Received webhook:", payload?.type);
          },
        }),
      ],
    }),
  ],

  trustedOrigins: [env.BACKEND_URL, env.FRONTEND_URL],
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.GITHUB_CLIENT_SECRET as string,
    },
    google:{
      clientId:env.GOOGLE_CLIENT_ID as string,
      clientSecret:env.GOOGLE_CLIENT_SECRET as string
    }
  },
  // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
    // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: "<your-workers-subdomain>",
    // },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          try {
            const newUserData = await db
              .update(schema.user)
              .set({ activeTier: "free" })
              .returning();
            return {
              data: {
                ...user,
                ...newUserData,
                context,
              },
            };
          } catch (error) {
            if (error instanceof Error) {
              throw new BetterAuthError(
                "Unable to create user",
                error?.message,
              );
            }
            throw new BetterAuthError("unable to create user");
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
