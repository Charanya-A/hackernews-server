import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { secretKey } from "../../../environment";

export const tokenMiddleware = createMiddleware<{
  Variables: {
    userId: string;
  };
}>(async (context, next) => {
  const token = context.req.header("token");

  if (!token) {
    return context.json(
      {
        message: "Missing Token",
      },
      401
    );
  }

  try {
    const payload = jwt.verify(token, secretKey) as jwt.JwtPayload;

    const userId = payload.sub;  //sub which contains userId

    if (userId) {
      context.set("userId", userId);  //Stores userId in the request context so that controllers can access it.
    } else {
      return context.json(
        {
          message: "Invalid Token",
        },
        401
      );
    }

    await next();  //If the token is valid, the request moves forward to the next middleware or controller.
  } catch (e) {
    return context.json(
      {
        message: "Missing Token",
      },
      401
    );
  }
});