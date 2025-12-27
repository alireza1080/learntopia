import { Request, Response } from 'express';
import { prisma } from 'services/db.service.ts';
import booleanValidator from 'validators/boolean.validator.ts';
import commentValidator from 'validators/description.validator.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';

const createComment = async (req: Request, res: Response) => {
  try {
    //! Get userId from request user object
    const userId = req.user?.id as string;

    //! Check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    const {
      courseId: rawCourseId,
      sessionId: rawSessionId,
      comment: rawComment,
      isItReply: rawIsItReply,
      replyTo: rawReplyTo,
    } = req.body;

    //! Validate courseId
    const {
      success: courseIdSuccess,
      error: courseIdError,
      data: courseId,
    } = mongodbIdValidator('Course ID').safeParse(rawCourseId);

    if (!courseIdSuccess) {
      return res
        .status(400)
        .json({ message: courseIdError?.issues[0]?.message });
    }

    //! Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(400).json({ message: 'Course not found' });
    }

    //! Validate sessionId
    const {
      success: sessionIdSuccess,
      error: sessionIdError,
      data: sessionId,
    } = mongodbIdValidator('Session ID').safeParse(rawSessionId);

    if (!sessionIdSuccess) {
      return res
        .status(400)
        .json({ message: sessionIdError?.issues[0]?.message });
    }

    //! Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      return res.status(400).json({ message: 'Session not found' });
    }

    //! Validate comment
    const {
      success: commentSuccess,
      error: commentError,
      data: comment,
    } = commentValidator('Comment', 2000, 10).safeParse(rawComment);

    if (!commentSuccess) {
      return res
        .status(400)
        .json({ message: commentError?.issues[0]?.message });
    }

    //! Validate isItReply
    const {
      success: isItReplySuccess,
      error: isItReplyError,
      data: isItReply,
    } = booleanValidator('Is it reply').safeParse(rawIsItReply);

    if (!isItReplySuccess) {
      return res
        .status(400)
        .json({ message: isItReplyError?.issues[0]?.message });
    }

    if (!isItReply) {
      //! Create new comment
      const newComment = await prisma.comment.create({
        data: {
          userId,
          courseId,
          sessionId,
          comment,
        },
      });

      return res
        .status(200)
        .json({ message: 'Comment created successfully', comment: newComment });
    }

    //! Validate replyTo
    const {
      success: replyToSuccess,
      error: replyToError,
      data: replyTo,
    } = mongodbIdValidator('Reply to comment ID').safeParse(rawReplyTo);

    if (!replyToSuccess) {
      return res
        .status(400)
        .json({ message: replyToError?.issues[0]?.message });
    }

    //! Check if replyTo comment exists
    const existingReplyTo = await prisma.comment.findUnique({
      where: { id: replyTo },
    });

    if (!existingReplyTo) {
      return res.status(400).json({ message: 'Reply to comment not found' });
    }

    //! Create new reply
    const newReply = await prisma.comment.create({
      data: {
        userId,
        courseId,
        sessionId,
        comment,
        isItReply: true,
        replyTo: replyTo,
      },
    });

    return res
      .status(200)
      .json({ message: 'Reply created successfully', reply: newReply });
  } catch (error) {
    console.error('Error creating comment', error);
    return res
      .status(500)
      .json({ message: 'Error creating comment, please try again later' });
  }
};

export { createComment };
