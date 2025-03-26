import type { User } from "@prisma/client";

export type GetMeResult = {
  user: User;
};

export enum GetMeError {
  BAD_REQUEST,
}

export interface UserResponse {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAllUsersResult {
  users: UserResponse[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}


export enum GetAllUsersError {
  INVALID_PAGINATION = "INVALID_PAGINATION",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}