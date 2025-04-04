import {allRoutes} from "./routes/routes";
import {serve} from "@hono/node-server";

serve(allRoutes, (info)=>{
    console.log(`server is running on port ${info.port}`);
});


// import {Hono} from "hono";
// import { secretKey } from "../environment";

// const app = new Hono();
// console.log(secretKey)
// app.get("/check", (context) => {
//   return context.json({message: "Hello, World!"}, 200);
// });

// serve(app, (info)=>{
//     console.log(`server is running on port ${info.port}`);
// });