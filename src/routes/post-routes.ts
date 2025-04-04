import { Hono } from "hono";
import { tokenMiddleware } from "./middlewares/token-middleware";
import { getAllPosts, getMyPosts, createPost, deletePost } from "../controllers/post/post-controller";
import { PostErrors } from "../controllers/post/post-types";


export const postRoutes = new Hono();

// Returns all posts in reverse chronological order (paginated)
postRoutes.get("/", tokenMiddleware, async (context) => {
  try {
    const pageParam = context.req.query("page");
    const limitParam = context.req.query("limit");
    
    if (!pageParam || !limitParam || isNaN(Number(pageParam)) || isNaN(Number(limitParam))) {
      return context.json({ message: PostErrors.INVALID_PAGINATION }, 400);
    }
    
    const page = parseInt(pageParam, 10);
    const limit = parseInt(limitParam, 10);
    
    if (page < 1 || limit < 1) {
      return context.json({ message: PostErrors.INVALID_PAGINATION }, 400);
    }

    const posts = await getAllPosts(page, limit);
    return context.json({ data: posts }, 200);
  } catch (e) {
    return context.json({ message: PostErrors.INTERNAL_SERVER_ERROR }, 500);
  }
});


// Returns all posts in reverse chronological order of the current user (referenced by attached JWT) (paginated)
postRoutes.get("/me", tokenMiddleware, async (context) => {
  try {
    const userId = context.get("userId");
    const pageParam = context.req.query("page");
    const limitParam = context.req.query("limit");
    
    if (!pageParam || !limitParam || isNaN(Number(pageParam)) || isNaN(Number(limitParam))) {
      return context.json({ message: PostErrors.INVALID_PAGINATION }, 400);
    }
    
    const page = parseInt(pageParam, 10);
    const limit = parseInt(limitParam, 10);
    
    if (page < 1 || limit < 1) {
      return context.json({ message: PostErrors.INVALID_PAGINATION }, 400);
    }
    if (!userId) {
        return context.json({ message: PostErrors.UNAUTHORIZED }, 401);
      }

    const posts = await getMyPosts(userId, page, limit);
    return context.json({ data: posts }, 200);
  } catch (e) {
    return context.json({ message: PostErrors.INTERNAL_SERVER_ERROR }, 500);
  }
});


// Creates a post (authored by the current user)
postRoutes.post("/", tokenMiddleware, async (context) => {
  try {
    const userId = context.get("userId");
    const { title, url, content } = await context.req.json();

    if (!userId || !title) {
        return context.json({ message: PostErrors.UNAUTHORIZED }, 401);
      }

    const newPost = await createPost({ title, url, content, userId });
    return context.json({ data: newPost }, 201);
  } catch (e) {
    return context.json({ message: PostErrors.INTERNAL_SERVER_ERROR }, 500);
  }
});


// Deletes a post (if it belongs to the user)
postRoutes.delete("/:postId", tokenMiddleware, async (context) => {
  try {
    const userId = context.get("userId");
    const postId = context.req.param("postId");

    if (!userId) {
        return context.json({ message: PostErrors.UNAUTHORIZED }, 401);
      }

    if (!postId) {
        return context.json({ message: PostErrors.INVALID_POST_ID }, 400);
      }

      const result = await deletePost(postId, userId);
      return context.json(result, 200);
    } catch (error) {
        const err = error as Error; 
    
        if (err.message === PostErrors.POST_NOT_FOUND) {
          return context.json({ message: err.message }, { status: 404 });
        }
        if (err.message === PostErrors.UNAUTHORIZED) {
          return context.json({ message: err.message }, { status: 403 });
        }
        return context.json({ message: PostErrors.INTERNAL_SERVER_ERROR }, 500);
      }
  });
  
