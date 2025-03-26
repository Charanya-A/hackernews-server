import { prisma } from "../../extras/prisma";
import { getPaginationParams } from "../../extras/pagination";
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

export const getAllUsers = async (query: { [key: string]: string | undefined }): Promise<GetAllUsersResult> => {
  try {
    const { page, limit, offset } = getPaginationParams(query);
    
    const totalUsers = await prisma.user.count();
    const users = await prisma.user.findMany({
      orderBy: { username: "asc" }, // Alphabetical order
      skip: offset,
      take: limit,
    });

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
        hasNextPage: offset + limit < totalUsers,
      },
    };
  } catch (error) {
    throw new Error(GetAllUsersError.INVALID_PAGINATION);
  }
};
