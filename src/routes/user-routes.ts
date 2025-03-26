import { Hono } from "hono";
import { prisma } from "../extras/prisma";
import { tokenMiddleware } from "./middlewares/token-middleware.ts";  // to ensure users are logged in
import { getAllUsers, getMe } from "../controllers/users/users-controller.ts";
import { GetAllUsersError, GetMeError } from "../controllers/users/users-types";
import { getPaginationParams } from "../extras/pagination";

export const usersRoutes = new Hono();

// Returns the current user's details (based on JWT token).
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



// Returns all the users in alphabetical order of their names (paginated).
//localhost:3000/users?page=1&limit=5 (for pagination)

usersRoutes.get("/", tokenMiddleware, async (context) => {
  try {
    const query = context.req.query();
    const result = await getAllUsers(query);

    return context.json(
      {
        data: result.users,
        pagination: result.pagination,
      },
      200
    );
  } catch (e) {
    if (e instanceof Error && e.message === GetAllUsersError.INVALID_PAGINATION) {
      return context.json(
        {
          error: "Invalid pagination parameters",
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