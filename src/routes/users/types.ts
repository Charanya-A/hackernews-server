import type { User } from "../../generated/prisma";

export type GetMeResult = {
  user: {
    id: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
    password?: string; // Make password optional
  };
};

export enum GetMeError {
  BAD_REQUEST = "User not found",
}

export interface UserResponse {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
}

export interface GetAllUsersResult {
  users: UserResponse[];
  pagination: PaginationMeta;
}

export enum GetAllUsersError {
  INVALID_PAGINATION = "Invalid pagination parameters",
  INTERNAL_SERVER_ERROR = "Internal server error",
}
