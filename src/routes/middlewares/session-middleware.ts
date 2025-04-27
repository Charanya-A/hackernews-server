// session-middleware.tsx

import { Hono } from "hono";
import { type Session, type User } from "better-auth";
import { createMiddleware } from "hono/factory";
import betterAuthServerClient from "../../integrations/better-auth";

export const authRoute = new Hono();

authRoute.on(["GET", "POST"], "*", (context) => {
  return betterAuthServerClient.handler(context.req.raw);
});

export type SessionVariables = {
  user: User;
  session: Session;
};

export const sessionMiddleware = createMiddleware<{
  Variables: SessionVariables & { userId: string };
}>(async (context, next) => {
  const session = await betterAuthServerClient.api.getSession({
    headers: context.req.raw.headers,
  });

  if (!session) {
    return context.body(null, 401);
  }

  const user = session.user as User;

  context.set("user", user);
  context.set("session", session.session);
  context.set("userId", user.id); 

  return await next();
});
