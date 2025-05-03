import type { Like } from "../../generated/prisma";


export interface LikeResponse {
    id: string;
    userId: string;
    postId: string;
    createdAt: Date;
    message?: string;
    like?: Like;
  }
  
  export interface PaginationMeta {
    totalLikes: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
  }
  
  export interface GetAllLikesResult {
    likes: LikeResponse[];
    pagination: PaginationMeta;
  }
  
  export const LikeErrors = {
    UNAUTHORIZED: "Unauthorized action",
    POST_ID_REQUIRED: "Post ID is required.",
    POST_NOT_FOUND: "Post not found",
    LIKE_NOT_FOUND: "Like not found",
    INVALID_PAGINATION: "Invalid pagination parameters",
    INTERNAL_SERVER_ERROR: "Internal Server Error",
  } as const;
  