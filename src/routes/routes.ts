import {Hono} from "hono";
import { postRoutes } from "./posts";
import { commentRoutes } from "./comment";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { authRoute } from "./middlewares/session-middleware";
import { usersRoutes } from "./users";
import { likeRoutes } from "./likes";
import { authenticationRoutes } from "./authentication";
import { webClientUrl } from "../../environment";

export const allRoutes = new Hono();

allRoutes.use(
  cors({
    origin: webClientUrl,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    exposeHeaders: ["Content-Length"],
  }),
);

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
allRoutes.route("/api/auth", authRoute);
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

  
  allRoutes.get("/doc", (c) =>
    c.json({
      openapi: "3.0.0",
      info: {
        title: "HackerNews API",
        version: "1.0.0",
        description: "HackerNews clone server"
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server"
        },
        {
          url: "https://hackernews.delightfulcliff-db9337fb.centralindia.azurecontainerapps.io",
          description: "Production server"
        }
      ],
      tags: [
        { name: "Authentication", description: "Authentication endpoints" },
        { name: "Users", description: "User management endpoints" },
        { name: "Posts", description: "Post management endpoints" },
        { name: "Likes", description: "Like management endpoints" },
        { name: "Comments", description: "Comment management endpoints" }
      ]
    })
  );
  
  // Swagger UI route
  allRoutes.get("/ui", swaggerUI({ url: "/doc" }));

  