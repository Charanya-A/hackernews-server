import { Hono } from "hono";
import { getAllPosts, getMyPosts, createPost, deletePost, getPostById, GetUserPosts, getPastPosts, searchPosts } from "./controllers";
import { PostErrors } from "./types";
import { sessionMiddleware } from "../middlewares/session-middleware";
import { z } from "zod";


export const postRoutes = new Hono();

// Returns all posts in reverse chronological order (paginated)
postRoutes.get("/", sessionMiddleware, async (context) => {
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

    const { posts} = await getAllPosts(page, limit);
    return context.json({ data: posts }, 200);
  } catch (e) {
    return context.json({ message: PostErrors.INTERNAL_SERVER_ERROR }, 500);
  }
});


// Returns all posts in reverse chronological order of the current user (referenced by attached JWT) (paginated)
postRoutes.get("/me", sessionMiddleware, async (context) => {
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

    const { posts } = await getMyPosts(userId, page, limit);
    return context.json({ data: posts }, 200);
  } catch (e) {
    return context.json({ message: PostErrors.INTERNAL_SERVER_ERROR }, 500);
  }
});


// Creates a post (authored by the current user)
postRoutes.post("/", sessionMiddleware, async (context) => {
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
postRoutes.delete("/:postId", sessionMiddleware, async (context) => {
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



  const searchSchema = z.object({
    query: z.string().min(1),
    page: z.string().optional(),
    limit: z.string().optional(),
  });
  
  postRoutes.get("/search", async (c) => {
    const parsed = searchSchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: "Invalid query parameters" }, 400);
    }
  
    const { query, page = '1', limit = '10' } = parsed.data;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
  
    try {
      const result = await searchPosts(query, pageNum, limitNum);
      return c.json(result);
    } catch (err) {
      return c.json({ error: 'Error retrieving posts', details: err instanceof Error ? err.message : err }, 500);
    }
  });
  

  postRoutes.get("/past", sessionMiddleware, async (context) => {
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
  
      const { posts, pagination } = await getPastPosts(page, limit);
      

      return context.json({ data: posts, pagination }, 200);
  
    } catch (e) {
      console.error("Internal error fetching past posts:", e);
      const error = e as Error;
      return context.json({ message: PostErrors.INTERNAL_SERVER_ERROR, error: error.message }, 500);
    }
  });


  
  postRoutes.get("/:postId", async (c) => {
    try {
      const postId = c.req.param("postId");
  
      const post = await getPostById(postId);
  
      if (!post) {
        return c.json({ error: "Post not found" }, 404);
      }
  
      const postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : null,
        user: post.user,
        comments: post.comments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : null,
        })),
      };
  
      return c.json({ post: postData }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Error retrieving post" }, 500);
    }
  }); 
