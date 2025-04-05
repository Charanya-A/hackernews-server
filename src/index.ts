import {allRoutes} from "./routes/routes";
import {serve} from "@hono/node-server";
import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';


const app = new Hono()

// Use the middleware to serve Swagger UI at /ui
app.get('/ui', swaggerUI({ url: '/doc' }))

export default app


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

