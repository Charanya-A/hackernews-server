
import { serve } from "@hono/node-server";
import { allRoutes } from "./routes/routes";

// Start the server
serve(allRoutes, ({ port }) => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
