
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { webClientUrl } from "../environment";
import { logger } from "hono/logger";
import { authenticationRoutes } from "./routes/authentication";
import { usersRoutes } from "./routes/users";
import { postRoutes } from "./routes/posts";
import { likeRoutes } from "./routes/likes";
import { commentRoutes } from "./routes/comment";






 const allRoutes = new Hono();

allRoutes.use(
  cors({
    origin: webClientUrl,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
    maxAge:600,
  }),
);



allRoutes.use(logger());

// registers routes

allRoutes.route("/auth", authenticationRoutes);
allRoutes.route("/users", usersRoutes);
allRoutes.route("/posts", postRoutes);
allRoutes.route("/likes", likeRoutes);
allRoutes.route("/comments", commentRoutes);



// Start the server
serve(allRoutes, ({ port }) => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
