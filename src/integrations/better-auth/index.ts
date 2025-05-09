import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuthSecret, serveUrl, webClientUrl } from "../../../environment";
import { prismaClient } from "../prisma";
import { username } from "better-auth/plugins";

const betterAuthServerClient = betterAuth({
  baseURL: serveUrl,
  basePath: "/auth",
  trustedOrigins: [webClientUrl],
  secret: betterAuthSecret,
  database: prismaAdapter(prismaClient, {
    provider: "postgresql",
  }),

advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },

  user: {
    modelName: "User",
  },
  session: {
    modelName: "Session",
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()]
});

export default betterAuthServerClient;