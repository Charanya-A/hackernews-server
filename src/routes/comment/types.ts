import type { Comment } from "../../generated/prisma";

export interface PaginationMeta {
    totalComments: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
  }
  
  export interface CommentResponse {
    id: string;
    content: string;
    userId: string;
    postId: string;
    parentId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface GetAllCommentsResult {
    comments: CommentResponse[];
    pagination: PaginationMeta;
  }
  
  export const CommentErrors = {
    POST_ID_REQUIRED: "Post ID is required.",
    COMMENT_ID_REQUIRED: "Comment ID is required.",
    CONTENT_REQUIRED : "Comment content is required",
    COMMENT_NOT_FOUND: "Comment not found.",
    POST_NOT_FOUND: "Post not found.",
    PARENT_COMMENT_NOT_FOUND : "The parent comment does not exist",
    UNAUTHORIZED: "User authentication required.",
    INVALID_PAGINATION: "Invalid pagination parameters.",
    CANNOT_DELETE_WITH_REPLIES: "Cannot delete a comment that has replies.",
    INTERNAL_SERVER_ERROR: "Internal Server Error.",
  };
  