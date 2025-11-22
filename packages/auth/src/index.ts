import { env } from "cloudflare:workers";
import { db } from "@morpics/db";
import * as schema from "@morpics/db/schema/auth";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  apiKey,
  lastLoginMethod,
  multiSession,
  oAuthProxy,
  organization,
} from "better-auth/plugins";

export const auth = betterAuth<BetterAuthOptions>({
  appName: "morpics",
  databaseHooks: {
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
    user: {
      create: {
        after: async () => {},
      },
    },
  },
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
  ],
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.GITHUB_CLIENT_SECRET as string,
    },
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
});
