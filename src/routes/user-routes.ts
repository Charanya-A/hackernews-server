import { Hono } from "hono";
import { prisma } from "../extras/prisma";
import { tokenMiddleware } from "./middlewares/token-middleware.ts";  // to ensure users are logged in
import { getAllUsers, getMe } from "../controllers/users/users-controller.ts";
import { GetMeError } from "../controllers/users/users-types";

export const usersRoutes = new Hono();

// Route - Get Current User Details
usersRoutes.get("/me", tokenMiddleware, async (context) => {
  const userId = context.get("userId");

  try {
    const user = await getMe({
      userId,
    });

    return context.json(
      {
        data: user,
      },
      200
    );
  } catch (e) {
    if (e === GetMeError.BAD_REQUEST) {
      return context.json(
        {
          error: "User not found",
        },
        400
      );
    }

    return context.json(
      {
        message: "Internal Server Error",
      },
      500
    );
  }
});

// Route - Get All Users
usersRoutes.get("", tokenMiddleware, async (context) => {
  try {
    const users = await getAllUsers();

    return context.json(
      {
        data: users,
      },
      200
    );
  } catch (e) {
    return context.json(
      {
        message: "Internal Server Error",
      },
      500
    );
  }
});