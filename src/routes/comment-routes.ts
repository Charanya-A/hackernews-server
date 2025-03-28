import { Hono } from "hono";
import { tokenMiddleware } from "./middlewares/token-middleware";
import { getCommentsOnPost, createComment, deleteComment, updateComment } from "../controllers/comment/comment-controller";
import { CommentErrors } from "../controllers/comment/comment-types";

export const commentRoutes = new Hono();


// Returns all the comments in reverse chronological order (paginated) on the post referenced by postId
commentRoutes.get("/on/:postId", tokenMiddleware, async (context) => {
  try {
    const postId = context.req.param("postId");
        const pageParam = context.req.query("page");
        const limitParam = context.req.query("limit");
            
            if (!pageParam || !limitParam || isNaN(Number(pageParam)) || isNaN(Number(limitParam))) {
              return context.json({ message: CommentErrors.INVALID_PAGINATION }, 400);
            }
            
            const page = parseInt(pageParam, 10);
            const limit = parseInt(limitParam, 10);
            
            if (page < 1 || limit < 1) {
              return context.json({ message: CommentErrors.INVALID_PAGINATION }, 400);
            }
    
        if (!postId) {
          return context.json({ message: CommentErrors.POST_ID_REQUIRED }, 400);
        }
    

    const comments = await getCommentsOnPost(postId, page, limit);
    return context.json({ data: comments }, 200);
  } catch (error) {
      const err = error as Error;
  
      if (err.message === CommentErrors.COMMENT_NOT_FOUND) {
        return context.json({ message: err.message }, 404);
      }
  
      return context.json({ message: CommentErrors.INTERNAL_SERVER_ERROR }, 500);
    }
});



// Creates a comment (authored by the current user) on the post referenced by postId
commentRoutes.post("/on/:postId", tokenMiddleware, async (context) => {
  try {
    const userId = context.get("userId");
    const postId = context.req.param("postId");
    const { content, parentId } = await context.req.json();

    if (!postId) {
        return context.json({ message: CommentErrors.POST_ID_REQUIRED }, 400);
      }

    if (!userId) {
      return context.json({ message: CommentErrors.UNAUTHORIZED }, 401);
    }

    if (!content || content.trim().length === 0) {
        return context.json({ message: CommentErrors.CONTENT_REQUIRED }, 400);
      }

    const comment = await createComment(postId, userId, content, parentId);
    return context.json({ message: "Comment created successfully", data: comment }, 201);
  } catch (error) {
    const err = error as Error;

    if (err.message === CommentErrors.POST_NOT_FOUND) {
        return context.json({ message: err.message }, 404);
    }

    if (err.message === CommentErrors.PARENT_COMMENT_NOT_FOUND) {
        return context.json({ message: err.message }, 404);
    }

    return context.json({ message: CommentErrors.INTERNAL_SERVER_ERROR }, 500);
}
});



// Deletes the comment (if existing and authored by the current user)
commentRoutes.delete("/:commentId", tokenMiddleware, async (context) => {
  try {
    const userId = context.get("userId");
    const commentId = context.req.param("commentId");
    if (!commentId) {
        return context.json({ message: CommentErrors.COMMENT_ID_REQUIRED }, 400);
      }
  
      if (!userId) {
        return context.json({ message: CommentErrors.UNAUTHORIZED }, 401);
      }

    const response = await deleteComment(commentId, userId);
    return context.json(response, 200);
  } catch (error) {
    const err = error as Error;

    if (err.message === CommentErrors.COMMENT_NOT_FOUND) {
      return context.json({ message: err.message }, 404);
    }

    if (err.message === CommentErrors.UNAUTHORIZED) {
      return context.json({ message: err.message }, 403);
    }

    if (err.message === CommentErrors.CANNOT_DELETE_WITH_REPLIES) {
      return context.json({ message: err.message }, 400); 
    }

    return context.json({ message: CommentErrors.INTERNAL_SERVER_ERROR }, 500);
  }
});



// Updates the comment's text (if existing and authored by the current user)
commentRoutes.patch("/:commentId", tokenMiddleware, async (context) => {
  try {
    const userId = context.get("userId");
    const commentId = context.req.param("commentId");
    const { content } = await context.req.json();

    if (!commentId) {
        return context.json({ message: CommentErrors.COMMENT_ID_REQUIRED }, 400);
      }
  
      if (!userId) {
        return context.json({ message: CommentErrors.UNAUTHORIZED }, 401);
      }
  
      if (!content || typeof content !== "string") {
        return context.json({ message: CommentErrors.CONTENT_REQUIRED }, 400);
      }
  
      const updatedComment = await updateComment(commentId, userId, content);
    
      return context.json({
        message: "Comment updated successfully.",
        data: updatedComment,  
      }, 200);
    } catch (error) {
      const err = error as Error;
  
      if (err.message === CommentErrors.COMMENT_NOT_FOUND) {
        return context.json({ message: err.message }, 404);
      }
  
      if (err.message === CommentErrors.UNAUTHORIZED) {
        return context.json({ message: err.message }, 403);
      }
  
      if (err.message === CommentErrors.CONTENT_REQUIRED) {
        return context.json({ message: err.message }, 400);
      }
  
      return context.json({ message: CommentErrors.INTERNAL_SERVER_ERROR }, 500);
    }
  });
