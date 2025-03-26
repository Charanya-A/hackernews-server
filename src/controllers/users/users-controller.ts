import { prisma } from "../../extras/prisma";
import { GetMeError, type GetMeResult, type GetAllUsersResult, GetAllUsersError } from "./users-types.ts";

export const getMe = async (parameters: { userId: string }): Promise<GetMeResult> => {
  const user = await prisma.user.findUnique({
    where: { id: parameters.userId },
  });

  if (!user) {
    throw new Error(String(GetMeError.BAD_REQUEST));
  }

  return { user };
};

export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<GetAllUsersResult> => {
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    orderBy: { username: "asc" }, // Sort alphabetically
    skip,
    take: limit,
  });

  const totalUsers = await prisma.user.count(); // Get total number of users

  return {
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page,
  };
};