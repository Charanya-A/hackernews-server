import {Hono} from "hono";
import { authenticationRoutes } from "./authentication-routes";
import { usersRoutes } from "./user-routes";
import { postRoutes } from "./post-routes";
import { likeRoutes } from "./like-routes";
import { commentRoutes } from "./comment-routes";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";

export const allRoutes = new Hono();

//logging middleware

allRoutes.use(async(context, next)=> {
  console.log("HTTP METHOD", context.req.method);
  console.log("URL",context.req.url);
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
allRoutes.get("/health", 
  (context) => {  
    console.log("health checked");
    return context.json({
          message: "all-ok"
      },
    200
  );
  });

  
  const swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "HackerNews API",
      version: "2.0.3",
      description: "HackerNews clone server"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://hackernews.delightfulcliff-db9337fb.centralindia.azurecontainerapps.io",
        description: "Production server",
      },
    ],
    tags: [
      { name: "Authentication", description: "Authentication endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "Posts", description: "Post management endpoints" },
      { name: "Likes", description: "Like management endpoints" },
      { name: "Comments", description: "Comment management endpoints" },
    ],
  };
  
  // 📜 Swagger UI at /ui
  allRoutes.get("/ui", swaggerUI({ url: "/docs" }));
  
  // 📄 Swagger JSON spec at /docs
  allRoutes.get("/docs", (c) => c.json(swaggerDocument));

  