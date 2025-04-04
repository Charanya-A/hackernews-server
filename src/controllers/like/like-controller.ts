import { prisma } from "../../extras/prisma";
import {
  type GetAllLikesResult,
  type LikeResponse,
  LikeErrors
} from "./like-types";



export const getLikesOnPost = async (
  postId: string,
  page: number = 1,
  limit: number = 10
): Promise<GetAllLikesResult> => {
  if (!postId) {
    throw new Error(LikeErrors.POST_ID_REQUIRED);
  }

  if (page < 1 || limit < 1) {
    throw new Error(LikeErrors.INVALID_PAGINATION);
  }

  const skip = (page - 1) * limit;
  const totalLikes = await prisma.like.count({ where: { postId } });

  if (totalLikes === 0) {
    throw new Error(LikeErrors.LIKE_NOT_FOUND);
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  return {
    likes,
    pagination: {
      totalLikes,  
      totalPages: Math.ceil(totalLikes / limit),
      currentPage: page,
      limit,
      hasNextPage: page * limit < totalLikes,
    },
  };
};



export const likePost = async (postId: string, userId: string): Promise<LikeResponse> => {
    if (!postId) {
        throw new Error(LikeErrors.POST_ID_REQUIRED);
      }
    
      if (!userId) {
        throw new Error(LikeErrors.UNAUTHORIZED);
      }

  const postExists = await prisma.post.findUnique({ where: { id: postId } });
  if (!postExists) {
    throw new Error(LikeErrors.POST_NOT_FOUND);
  }

  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existingLike) {
    return existingLike; 
  }

  const newLike = await prisma.like.create({
    data: { userId, postId },
  });

  return newLike;
};



export const unlikePost = async (postId: string, userId: string): Promise<{ message: string }> => {
    if (!postId) {
        throw new Error(LikeErrors.POST_ID_REQUIRED);
      }
    
      if (!userId) {
        throw new Error(LikeErrors.UNAUTHORIZED);
      }

  const like = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (!like) {
    throw new Error(LikeErrors.LIKE_NOT_FOUND);
  }

  await prisma.like.delete({
    where: { userId_postId: { userId, postId } },
  });

  return { message: "Unliked the post successfully" };
};
