import { Hono } from "hono";
import { authenticationRoutes } from "./authentication-routes";
import { usersRoutes } from "./user-routes.ts";
import { postRoutes } from "./post-routes.ts";
import { likeRoutes } from "./like-routes.ts";
import { commentRoutes } from "./comment-routes.ts";
import { logger } from "hono/logger";
export const allRoutes = new Hono();
//logging middleware
allRoutes.use(async (context, next) => {
    console.log("HTTP METHOD", context.req.method);
    console.log("URL", context.req.url);
    console.log("HEADERS", context.req.header());
    await next();
});
allRoutes.use(logger());
// registers routes
allRoutes.route("/auth", authenticationRoutes);
allRoutes.route("/users", usersRoutes);
allRoutes.route("/posts", postRoutes);
allRoutes.route("/likes", likeRoutes);
allRoutes.route("/comments", commentRoutes);
// API status check
allRoutes.get("/health", (context) => {
    console.log("health checked");
    return context.json({
        message: "all-ok"
    }, 200);
});
