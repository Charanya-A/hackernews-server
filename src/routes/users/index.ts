import { Hono } from "hono";
import { authenticationMiddleware } from "../middlewares/session-middleware";
import { getAllUsers, getMe } from "./controllers";
import { GetAllUsersError, GetMeError } from "./types";



export const usersRoutes = new Hono();

// Returns the current user's details (based on JWT token).
usersRoutes.get("/me", authenticationMiddleware, async (context) => {
  try {
    const userId = context.get("user").id;

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

      return context.json({ message: GetAllUsersError.INTERNAL_SERVER_ERROR }, 500);
  }
});


// Returns all the users in alphabetical order of their names (paginated).
//localhost:3000/users?page=1&limit=2 (for pagination)
usersRoutes.get("", authenticationMiddleware, async (context) => {
  try {
    const pageParam = context.req.query("page");
const limitParam = context.req.query("limit");

if (!pageParam || !limitParam || isNaN(Number(pageParam)) || isNaN(Number(limitParam))) {
  return context.json({ error: GetAllUsersError.INVALID_PAGINATION }, 400);
}

const page = parseInt(pageParam, 10);
const limit = parseInt(limitParam, 10);

if (page < 1 || limit < 1) {
  return context.json({ error: GetAllUsersError.INVALID_PAGINATION }, 400);
}

    const result = await getAllUsers(page, limit);

    return context.json({ data: result.users, pagination: result.pagination }, 
      200);
  } catch (error) 
  {
    return context.json({ message: GetAllUsersError.INTERNAL_SERVER_ERROR }, 500);
  }
});