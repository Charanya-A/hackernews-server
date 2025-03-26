import { Hono } from "hono";
import { prisma } from "../extras/prisma";
import { tokenMiddleware } from "./middlewares/token-middleware.ts";  // to ensure users are logged in
import { getAllUsers, getMe } from "../controllers/users/users-controller.ts";
import { GetAllUsersError, GetMeError } from "../controllers/users/users-types";


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
usersRoutes.get("", tokenMiddleware, async (context) => {
  try {
    const page = parseInt(context.req.query("page") || "1", 10);
    const limit = parseInt(context.req.query("limit") || "10", 10);
if (page < 1 || limit < 1){
  return context.json({
message: "Invalid pagination"}, 400);  }
    const users = await getAllUsers(page, limit);

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