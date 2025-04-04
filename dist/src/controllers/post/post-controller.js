import { prisma } from "../../extras/prisma";
import { PostErrors } from "./post-types.ts";
export const getAllPosts = async (page = 1, limit = 10) => {
    if (page < 1 || limit < 1) {
        throw new Error(PostErrors.INVALID_PAGINATION);
    }
    const skip = (page - 1) * limit;
    const totalPosts = await prisma.post.count();
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" }, //Reverse chronological order
        skip,
        take: limit,
    });
    return {
        posts,
        pagination: {
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: page,
            limit,
            hasNextPage: skip + limit < totalPosts,
        },
    };
};
export const getMyPosts = async (userId, page = 1, limit = 10) => {
    if (!userId) {
        throw new Error(PostErrors.UNAUTHORIZED);
    }
    if (page < 1 || limit < 1) {
        throw new Error(PostErrors.INVALID_PAGINATION);
    }
    const skip = (page - 1) * limit;
    const totalPosts = await prisma.post.count({
        where: { userId },
    });
    const posts = await prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
    });
    return {
        posts,
        pagination: {
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: page,
            limit,
            hasNextPage: skip + limit < totalPosts,
        },
    };
};
export const createPost = async ({ title, url, content, userId }) => {
    if (!title || !userId) {
        throw new Error(PostErrors.UNAUTHORIZED);
    }
    const newPost = await prisma.post.create({
        data: {
            title,
            url,
            content,
            userId
        },
    });
    return newPost;
};
export const updatePost = async (postId, userId, title, url, content) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new Error(PostErrors.POST_NOT_FOUND);
    }
    if (post.userId !== userId) {
        throw new Error(PostErrors.UNAUTHORIZED);
    }
    const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
            title: title || post.title,
            url: url !== undefined ? url : post.url,
            content: content !== undefined ? content : post.content,
        },
    });
    return updatedPost;
};
export const deletePost = async (postId, userId) => {
    if (!postId || !userId) {
        throw new Error(PostErrors.UNAUTHORIZED);
    }
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new Error(PostErrors.POST_NOT_FOUND);
    }
    if (post.userId !== userId) {
        throw new Error(PostErrors.UNAUTHORIZED);
    }
    await prisma.post.delete({ where: { id: postId } });
    return { message: "Post deleted successfully" };
};
