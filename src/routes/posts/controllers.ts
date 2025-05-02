
import { prismaClient as prisma } from "../../integrations/prisma"
import {
  type GetAllPostsResult,
  type PostResponse,
  PostErrors, type CreatePostParams
} from "./types";
import { Prisma } from '@prisma/client'; 


export const getAllPosts = async (
    page: number = 1,
    limit: number = 10
  ): Promise<GetAllPostsResult> => {
    if (page < 1 || limit < 1) {
        throw new Error(PostErrors.INVALID_PAGINATION);
      }

    const skip = (page - 1) * limit;
    const totalPosts = await prisma.post.count();

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },  //Reverse chronological order
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
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

  

export const getMyPosts = async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<GetAllPostsResult> => {
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
  

  export const getPastPosts = async (
    page: number = 1,
    limit: number = 10
  ): Promise<GetAllPostsResult> => {
    try {
      if (page < 1 || limit < 1) {
        throw new Error(PostErrors.INVALID_PAGINATION);
      }
  
      const skip = (page - 1) * limit;
      const totalPosts = await prisma.post.count();
  
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
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
    } catch (e) {
      console.error("Error in getPastPosts:", e);
      throw new Error("Error retrieving past post");
    }
  };
  

  export const createPost = async ({ title, url, content, userId }: CreatePostParams): Promise<PostResponse> => {
    if (!title || !userId) 
    {
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




  export const updatePost = async (
    postId: string,
    userId: string,
    title?: string,
    url?: string,
    content?: string
  ): Promise<PostResponse> => {
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
  


  export const deletePost = async (postId: string, userId: string): Promise<{ message: string }> => {
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



  export const getPostById = async (postId: string) => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true, username: true } },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true, 
            user: { select: { username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  
    if (!post) {
      throw new Error("Post not found");
    }
  
    return post;
  };



  export const GetUserPosts = async (parameters: {
    userId: string;
    page: number;
    limit: number;
  }): Promise<GetAllPostsResult> => {
    try {
      const { userId, page, limit } = parameters;
  
      const totalPosts = await prisma.post.count({
        where: { userId },
      });
  
      if (totalPosts === 0) {
        throw PostErrors.POST_NOT_FOUND;
      }
  
      const totalPages = Math.ceil(totalPosts / limit);
      if (page > totalPages) {
        throw PostErrors.PAGE_BEYOND_LIMIT;
      }
  
      const posts = await prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit, // Pagination: Skip previous pages
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });
  
      return {
        posts,
        pagination: {
          totalPosts,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
        },
      };
    } catch (e) {
      if (e === PostErrors.POST_NOT_FOUND) {
        throw PostErrors.POST_NOT_FOUND;
      }
      if (e === PostErrors.PAGE_BEYOND_LIMIT) {
        throw PostErrors.PAGE_BEYOND_LIMIT;
      }
      throw PostErrors.UNKNOWN;
    }
  };
  


  export const searchPosts = async (query: string, pageNum = 1, limitNum = 10) => {
    const skip = (pageNum - 1) * limitNum;
  
    const filter = {
      OR: [
        { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { content: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { url: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { user: { is: { username: { contains: query, mode: Prisma.QueryMode.insensitive } } } },
        { comments: { some: { content: { contains: query, mode: Prisma.QueryMode.insensitive } } } },
      ],
    };
  
    try {
      const [totalPosts, posts] = await Promise.all([
        prisma.post.count({ where: filter }),
        prisma.post.findMany({
          where: filter,
          include: {
            user: { select: { id: true, username: true } },
            comments: { select: { id: true } },
            _count: { select: { comments: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
      ]);
  
      if (totalPosts === 0) {
        return {
          data: [],
          pagination: {
            totalPosts: 0,
            totalPages: 0,
            currentPage: pageNum,
            limit: limitNum,
            hasNextPage: false,
          },
        };
      }
  
      return {
        data: posts,
        pagination: {
          totalPosts,
          totalPages: Math.ceil(totalPosts / limitNum),
          currentPage: pageNum,
          limit: limitNum,
          hasNextPage: skip + limitNum < totalPosts,
        },
      };
    } catch (err) {
      throw new Error('Error retrieving posts');
    }
  };