import { Hono } from "hono";
import { prisma } from "../extras/prisma";
import { tokenMiddleware } from "./middlewares/token-middleware.ts";  // to ensure users are logged in
import { getAllUsers, getMe } from "../controllers/users/users-controller.ts";
import { GetAllUsersError, GetMeError } from "../controllers/users/users-types";


export const usersRoutes = new Hono();

// Returns the current user's details (based on JWT token).
usersRoutes.get("/me", tokenMiddleware, async (context) => {
  try {
    const userId = context.get("userId");

    if (!userId) {
      return context.json(
        { 
          error: "Unauthorized"
         }, 
         401);
    }

    const result = await getMe({ userId });

    return context.json(
      { 
        data: result.user 
      }, 
      200);
  } catch (error) {
    if ((error as Error).message === GetMeError.BAD_REQUEST) 
      {
      return context.json({ error: GetMeError.BAD_REQUEST }, 
        400);
      }

    return context.json({ error: "Internal Server Error" }, 
      500);
  }
});


// Returns all the users in alphabetical order of their names (paginated).
//localhost:3000/users?page=1&limit=2 (for pagination)
usersRoutes.get("", tokenMiddleware, async (context) => {
  try {
    const page = parseInt(context.req.query("page") || "1", 10);
    const limit = parseInt(context.req.query("limit") || "10", 10);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) 
    {
      return context.json({ error: GetAllUsersError.INVALID_PAGINATION }, 
        400);
    }

    const result = await getAllUsers(page, limit);

    return context.json({ data: result.users, pagination: result.pagination }, 
      200);
  } catch (error) 
  {
    return context.json({ error: "Internal Server Error" }, 
      500);
  }
});