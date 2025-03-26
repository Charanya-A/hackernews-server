import type { User } from "@prisma/client";

export type GetMeResult = {
  user: User;
};

export enum GetMeError {
  BAD_REQUEST,
}

export type GetAllUsersResult = {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
    hasNextPage: boolean;
  };
};

export enum GetAllUsersError {
  INVALID_PAGINATION = "INVALID_PAGINATION",
}