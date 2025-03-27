import type { Post } from "@prisma/client";

export interface PostResponse {
  id: string;
  title: string;
  url?: string | null; // Accepts both undefined and null
  content?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
}

export interface GetAllPostsResult {
  posts: PostResponse[];
  pagination: PaginationMeta;
}


export type CreatePostParams = {
    title: string;
    url?: string;
    content?: string;
    userId: string;
};


export enum PostErrors {
  INVALID_PAGINATION = "Invalid pagination parameters",
  POST_NOT_FOUND = "Post not found",
  UNAUTHORIZED = "Unauthorized action",
  INTERNAL_SERVER_ERROR = "Internal Server Error",
  INVALID_POST_ID = "INVALID_POST_ID",
}
