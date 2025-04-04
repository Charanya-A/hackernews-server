import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { secretKey } from "../../../environment";
export const tokenMiddleware = createMiddleware(async (context, next) => {
    const token = context.req.header("token");
    if (!token) {
        return context.json({
            message: "Missing Token",
        }, 401);
    }
    try {
        const payload = jwt.verify(token, secretKey);
        const userId = payload.sub;
        if (userId) {
            context.set("userId", userId);
        }
        else {
            return context.json({
                message: "Invalid Token",
            }, 401);
        }
        await next();
    }
    catch (e) {
        return context.json({
            message: "Missing Token",
        }, 401);
    }
});
