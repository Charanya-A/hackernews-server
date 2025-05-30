import { prismaClient as prisma } from "../../integrations/prisma"
import { CommentErrors, type GetAllCommentsResult, type CommentResponse } from "./types";


export const getCommentsOnPost = async (
  postId: string,
  page: number = 1,
  limit: number = 10
): Promise<GetAllCommentsResult> => {
  if (!postId) {
    throw new Error(CommentErrors.POST_ID_REQUIRED);
  }

  if (page < 1 || limit < 1) {
    throw new Error(CommentErrors.INVALID_PAGINATION);
  }

  const skip = (page - 1) * limit;
  const totalComments = await prisma.comment.count({ where: { postId } });

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    include: {
      replies: true,
    },
  });

  return {
    comments, 
    pagination: {
      totalComments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page,
      limit,
      hasNextPage: page * limit < totalComments,
    },
  };
};



export const createComment = async (
  postId: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<CommentResponse> => {
  if (!postId) {
    throw new Error(CommentErrors.POST_ID_REQUIRED);
  }
  if (!userId) {
    throw new Error(CommentErrors.UNAUTHORIZED);
  }
  if (!content || content.trim().length === 0) {
    throw new Error(CommentErrors.CONTENT_REQUIRED);
  }

  const postExists = await prisma.post.findUnique({ where: { id: postId } });
  if (!postExists) {
    throw new Error(CommentErrors.POST_NOT_FOUND);
  }

  // Top-level comments will have parentId = NULL
  // Replies will have parentId set to the id of the parent comment

  let parentComment = null;

  if (parentId) {
    parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      include: { replies: true }, // Ensure replies are tracked
    });
    if (!parentComment) {
      throw new Error(CommentErrors.PARENT_COMMENT_NOT_FOUND);
    }
  }

  const newComment = await prisma.comment.create({
    data: {
      content,
      userId,
      postId,
      parentId: parentComment ? parentId : null,
    },
    include: {
      user: { select: { id: true, username: true } },
      replies: true,
    },
  });

  return newComment;
};



export const deleteComment = async (commentId: string, userId: string): Promise<{ message: string }> => {
  if (!commentId) {
    throw new Error(CommentErrors.COMMENT_ID_REQUIRED);
  }
  if (!userId) {
    throw new Error(CommentErrors.UNAUTHORIZED);
  }

  // Fetch the comment along with its replies
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { replies: true }, // Ensure replies are check
  });

  if (!comment) {
    throw new Error(CommentErrors.COMMENT_NOT_FOUND);
  }
  if (comment.userId !== userId) {
    throw new Error(CommentErrors.UNAUTHORIZED);
  }

  // According to Hackernews-server, a parent comment cannot be deleted unless replies are deleted

  // Prevent deletion if there are existing replies
  if (comment.replies.length > 0) {                           
    throw new Error(CommentErrors.CANNOT_DELETE_WITH_REPLIES);
  }

  // Delete the comment if no replies exist
  await prisma.comment.delete({ where: { id: commentId } });

  return { message: "Comment deleted successfully." };
};



export const updateComment = async (
  commentId: string,
  userId: string,
  content: string
): Promise<CommentResponse> => {
  if (!commentId) {
    throw new Error(CommentErrors.COMMENT_ID_REQUIRED);
  }
  if (!userId) {
    throw new Error(CommentErrors.UNAUTHORIZED);
  }
  if (!content || content.trim() === "") {
    throw new Error(CommentErrors.CONTENT_REQUIRED);
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw new Error(CommentErrors.COMMENT_NOT_FOUND);
  }
  if (comment.userId !== userId) {
    throw new Error(CommentErrors.UNAUTHORIZED);
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content, updatedAt: new Date() },
  });

  return updatedComment;
};


export async function getCommentById(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  return comment;
}


