import { prisma } from "../../extras/prisma";
import { GetMeError, GetAllUsersError } from "./users-types.ts";
export const getMe = async (parameters) => {
    const user = await prisma.user.findUnique({
        where: { id: parameters.userId },
    });
    if (!user) {
        throw new Error(String(GetMeError.BAD_REQUEST));
    }
    return { user };
};
export const getAllUsers = async (page = 1, limit = 10) => {
    if (page < 1 || limit < 1) {
        throw new Error(GetAllUsersError.INVALID_PAGINATION);
    }
    const skip = (page - 1) * limit;
    const totalUsers = await prisma.user.count();
    const users = await prisma.user.findMany({
        orderBy: { username: "asc" },
        skip,
        take: limit,
        select: { id: true, username: true, createdAt: true, updatedAt: true },
    });
    return {
        users,
        pagination: {
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            limit,
            hasNextPage: skip + limit < totalUsers,
        },
    };
};
