import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { createAccessControl } from "better-auth/plugins/access";
import { admin } from "better-auth/plugins/admin";
import { defaultStatements } from "better-auth/plugins/admin/access";

import { db } from "@/db";
import { account, session, user, verification } from "@/db/auth-schema";
import { ADMIN_ROLES } from "@/lib/roles";

/**
 * The admin plugin only accepts roles that exist in its access-control map, so the
 * warehouse/ops roles used by the console are declared here. Fine-grained module
 * permissions still live in `src/lib/roles.ts` and are enforced per API route.
 */
const ac = createAccessControl(defaultStatements);

const fullAccess = ac.newRole({ user: [...defaultStatements.user], session: [...defaultStatements.session] });
const internalAccess = ac.newRole({ user: ["list", "get"], session: ["list"] });
const customerAccess = ac.newRole({ user: [], session: [] });

const roles = {
  super_admin: fullAccess,
  admin: fullAccess,
  ops_manager: internalAccess,
  procurement: internalAccess,
  support: internalAccess,
  finance: internalAccess,
  content: internalAccess,
  customer: customerAccess,
};

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

/**
 * Admin consoles and previews are routinely served from a local port other than
 * 3000, so any localhost origin is trusted in addition to the configured ones.
 */
const trustedOrigins = Array.from(
  new Set(
    [
      baseURL,
      process.env.NEXT_PUBLIC_SITE_URL,
      "http://localhost:*",
      "http://127.0.0.1:*",
      ...(process.env.TRUSTED_ORIGINS?.split(",") ?? []),
    ]
      .map((origin) => origin?.trim())
      .filter((origin): origin is string => Boolean(origin)),
  ),
);

export const auth = betterAuth({
  appName: "ChinaBridge BD",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET ?? "chinabridge-dev-secret-change-me-please-32chars",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false, defaultValue: "", input: true },
      customerId: { type: "string", required: false, defaultValue: "", input: false },
    },
  },
  plugins: [
    admin({
      defaultRole: "customer",
      adminRoles: [...ADMIN_ROLES],
      roles,
    }),
    nextCookies(),
  ],
  trustedOrigins,
});

export type Auth = typeof auth;
