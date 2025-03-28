import { Hono } from "hono";
import { tokenMiddleware } from "./middlewares/token-middleware.ts";
import { getLikesOnPost, likePost, unlikePost } from "../controllers/like/like-controller";
import { LikeErrors } from "../controllers/like/like-types";

export const likeRoutes = new Hono();


// Returns all the likes in reverse chronological order (paginated) on the post referenced by postId
likeRoutes.get("/on/:postId", tokenMiddleware, async (context) => {
  try {
    const postId = context.req.param("postId");
    const pageParam = context.req.query("page");
    const limitParam = context.req.query("limit");
        
        if (!pageParam || !limitParam || isNaN(Number(pageParam)) || isNaN(Number(limitParam))) {
          return context.json({ message: LikeErrors.INVALID_PAGINATION }, 400);
        }
        
        const page = parseInt(pageParam, 10);
        const limit = parseInt(limitParam, 10);
        
        if (page < 1 || limit < 1) {
          return context.json({ message: LikeErrors.INVALID_PAGINATION }, 400);
        }

    if (!postId) {
      return context.json({ message: LikeErrors.POST_ID_REQUIRED }, 400);
    }

    const likes = await getLikesOnPost(postId, page, limit);
    return context.json({ data: likes }, 200);
  } catch (error) {
    const err = error as Error;

    if (err.message === LikeErrors.LIKE_NOT_FOUND) {
      return context.json({ message: err.message }, 404);
    }

    return context.json({ message: LikeErrors.INTERNAL_SERVER_ERROR }, 500);
  }
});



// Creates a like (authored by the current user) on the post referenced by postId
likeRoutes.post("/on/:postId", tokenMiddleware, async (context) => {
  try {
    const userId = context.get("userId");
    const postId = context.req.param("postId");

    if (!userId) {
      return context.json({ message: LikeErrors.UNAUTHORIZED }, 401);
    }

    if (!postId) {
        return context.json({ message: LikeErrors.POST_ID_REQUIRED }, 400);
      }

      const like = await likePost(postId, userId);

      if (like) {
        return context.json({ message: "This Post has already been liked", data: like }, 200);
      }

      return context.json({ 
        message: "Post liked successfully", 
        data: like 
      }, 201);
  } catch (error) {
    const err = error as Error;

    if (err.message === LikeErrors.POST_NOT_FOUND) {
      return context.json({ message: err.message }, 404);
    }

    return context.json({ message: LikeErrors.INTERNAL_SERVER_ERROR }, 500);
  }
});



// Deletes the like (if existing and authored by the current user) on the post referenced by postId
likeRoutes.delete("/on/:postId", tokenMiddleware, async (context) => {
  try {
    const userId = context.get("userId");
    const postId = context.req.param("postId");

    if (!postId) {
        return context.json({ message: LikeErrors.POST_ID_REQUIRED }, 400);
    }
  
    if (!userId) {
        return context.json({ message: LikeErrors.UNAUTHORIZED }, 401);
    }

    const result = await unlikePost(postId, userId);
    return context.json(result, 200);
  } catch (error) {
    const err = error as Error;

    if (err.message === LikeErrors.LIKE_NOT_FOUND) {
      return context.json({ message: err.message }, 404);
    }
    if (err.message === LikeErrors.UNAUTHORIZED) {
      return context.json({ message: err.message }, 403);
    }
    return context.json({ message: "Internal Server Error" }, 500);
  }
});
