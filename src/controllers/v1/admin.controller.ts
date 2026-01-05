import { Request, Response } from 'express';
import { prisma } from 'services/db.service.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';
import roleValidator from 'validators/role.validator.ts';
import { Role } from 'generated/prisma/client.ts';
import positiveNumberValidator from 'validators/positiveNumber.validator.ts';
import commentValidator from 'validators/description.validator.ts';

const banUser = async (req: Request, res: Response) => {
  try {
    const { violatorId } = req.params;

    //! check if violator id is valid
    const { success: violatorIdSuccess, error: violatorIdError } =
      mongodbIdValidator('Violator ID').safeParse(violatorId);

    if (!violatorIdSuccess) {
      return res
        .status(400)
        .json({ message: violatorIdError?.issues[0]?.message });
    }

    //! check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: violatorId,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    //! check if user is not already banned
    const isBanned = await prisma.bannedUser.findUnique({
      where: {
        userId: violatorId,
      },
    });

    if (isBanned) {
      return res.status(400).json({ message: 'User is already banned' });
    }

    const bannedBy = req.user?.id;

    //! get reason from request body
    const reason =
      String(req?.body?.reason?.trim()) || 'Violated the terms of service';

    //! ban user by updating user isBanned field to true && create a banned user record
    const [updatedUser, bannedUser] = await Promise.all([
      prisma.user.update({
        where: {
          id: violatorId,
        },
        data: { isBanned: true },
      }),
      prisma.bannedUser.create({
        data: {
          userId: violatorId,
          reason,
          bannedBy: bannedBy as string,
        },
      }),
    ]);

    return res.status(200).json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Error banning user', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const unBanUser = async (req: Request, res: Response) => {
  try {
    const { violatorId } = req.params;

    //! check if violator id is valid
    const { success: violatorIdSuccess, error: violatorIdError } =
      mongodbIdValidator('Violator ID').safeParse(violatorId);

    if (!violatorIdSuccess) {
      return res
        .status(400)
        .json({ message: violatorIdError?.issues[0]?.message });
    }

    //! check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: violatorId,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    //! check if user is banned
    const isBanned = await prisma.bannedUser.findUnique({
      where: {
        userId: violatorId,
      },
    });

    if (!isBanned) {
      return res.status(400).json({ message: 'User is not banned' });
    }

    //! unban user by updating user isBanned field to false && delete the banned user record
    const [updatedUser, deletedBannedUser] = await Promise.all([
      prisma.user.update({
        where: {
          id: violatorId,
        },
        data: { isBanned: false },
      }),
      prisma.bannedUser.delete({
        where: {
          userId: violatorId,
        },
      }),
    ]);

    return res.status(200).json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Error unbanning user', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const {
      page: rawPage,
      limit: rawLimit,
      orderBy: rawOrderBy,
    } = req.query as {
      page: string | undefined;
      limit: string | undefined;
      orderBy: 'asc' | 'desc' | undefined;
    };

    const [page, limit] = [Number(rawPage) || 1, Number(rawLimit) || 10];

    const orderBy = rawOrderBy === 'asc' ? 'asc' : 'desc';

    //! get all users
    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: orderBy },
      omit: { password: true },
    });

    return res
      .status(200)
      .json({ message: 'Users fetched successfully', data: users });
  } catch (error) {
    console.error('Error getting all users', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    //! check if user id is valid
    const { success: userIdSuccess, error: userIdError } =
      mongodbIdValidator('User ID').safeParse(userId);

    if (!userIdSuccess) {
      return res.status(400).json({ message: userIdError?.issues[0]?.message });
    }

    //! check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    //! delete user
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    if (!deletedUser) {
      return res
        .status(400)
        .json({ message: 'Failed to delete user, try again later' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    //! check if user id is valid
    const { success: userIdSuccess, error: userIdError } =
      mongodbIdValidator('User ID').safeParse(userId);

    if (!userIdSuccess) {
      return res.status(400).json({ message: userIdError?.issues[0]?.message });
    }

    //! check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    //! check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    //! get role from request body
    const { role: rawRole } = req.body;

    //! check if role is valid
    const {
      success: roleSuccess,
      data: role,
      error: roleError,
    } = roleValidator.safeParse(rawRole);

    if (!roleSuccess) {
      return res.status(400).json({ message: roleError?.issues[0]?.message });
    }

    //! check if the operator is not the same as the user
    if (req.user?.id === userId) {
      return res
        .status(400)
        .json({ message: 'You cannot update your own role' });
    }

    //! check if role is different from current role
    if (role === user.role) {
      return res
        .status(400)
        .json({ message: 'New role is the same as current role' });
    }

    //! update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: 'Failed to update user role, try again later' });
    }

    return res.status(200).json({
      message: `${user.name}'s role updated to ${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Error updating user role', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCourseByCourseId = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    //! check if course id is valid
    const { success: courseIdSuccess, error: courseIdError } =
      mongodbIdValidator('Course ID').safeParse(courseId);

    if (!courseIdSuccess) {
      return res
        .status(400)
        .json({ message: courseIdError?.issues[0]?.message });
    }

    //! check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(400).json({ message: 'Course not found' });
    }

    //! delete all the comments for the course
    const deletedComments = await prisma.comment.deleteMany({
      where: { courseId },
    });

    //! delete all the ratings for the course
    const deletedRatings = await prisma.courseRating.deleteMany({
      where: { courseId },
    });

    //! delete user course records for the course
    const deletedUserCourses = await prisma.userCourse.deleteMany({
      where: { courseId },
    });

    //! delete all the sessions for the course
    const deletedSessions = await prisma.session.deleteMany({
      where: { courseId },
    });

    // TODO: Delete the course videos and course cover image form the storage

    //! delete the course
    const deletedCourse = await prisma.course.delete({
      where: { id: courseId },
    });

    if (!deletedCourse) {
      return res
        .status(400)
        .json({ message: 'Failed to delete course, try again later' });
    }

    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllNotApprovedComments = async (req: Request, res: Response) => {
  try {
    //! get count from request params
    const { page: rawPage, count: rawCount } = req.params;

    //! validate page
    const {
      success: pageSuccess,
      error: pageError,
      data: page,
    } = positiveNumberValidator('Page').safeParse(+rawPage);

    if (!pageSuccess) {
      return res.status(400).json({ message: pageError?.issues[0]?.message });
    }

    //! validate count
    const {
      success: countSuccess,
      error: countError,
      data: count,
    } = positiveNumberValidator('Count').safeParse(+rawCount);

    if (!countSuccess) {
      return res.status(400).json({ message: countError?.issues[0]?.message });
    }

    //! get not approved comments
    const notApprovedComments = await prisma.comment.findMany({
      where: { isApproved: false },
      skip: (page - 1) * count,
      take: count,
    });

    return res.status(200).json({
      message: 'Not approved comments fetched successfully',
      data: notApprovedComments,
    });
  } catch (error) {
    console.error('Error getting all not approved comments', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const approveComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    //! validate comment id
    const { success: commentIdSuccess, error: commentIdError } =
      mongodbIdValidator('Comment ID').safeParse(commentId);

    if (!commentIdSuccess) {
      return res
        .status(400)
        .json({ message: commentIdError?.issues[0]?.message });
    }

    //! check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(400).json({ message: 'Comment not found' });
    }

    //! approve comment by updating isApproved field to true
    const approvedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { isApproved: true },
    });

    if (!approvedComment) {
      return res
        .status(400)
        .json({ message: 'Failed to approve comment, try again later' });
    }

    return res.status(200).json({ message: 'Comment approved successfully' });
  } catch (error) {
    console.error('Error approving comment', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    //! validate comment id
    const { success: commentIdSuccess, error: commentIdError } =
      mongodbIdValidator('Comment ID').safeParse(commentId);

    if (!commentIdSuccess) {
      return res
        .status(400)
        .json({ message: commentIdError?.issues[0]?.message });
    }

    //! check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(400).json({ message: 'Comment not found' });
    }

    //! delete comment
    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
    });

    if (!deletedComment) {
      return res
        .status(400)
        .json({ message: 'Failed to delete comment, try again later' });
    }

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const replyToComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    //! validate comment id
    const { success: commentIdSuccess, error: commentIdError } =
      mongodbIdValidator('Comment ID').safeParse(commentId);

    if (!commentIdSuccess) {
      return res
        .status(400)
        .json({ message: commentIdError?.issues[0]?.message });
    }

    //! check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(400).json({ message: 'Comment not found' });
    }

    //! check if comment is a reply
    if (comment.isItReply) {
      return res.status(400).json({ message: 'You cannot reply to a reply' });
    }

    //! check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    //! get reply from request body
    const { reply } = req.body;

    //! validate reply
    const { success: replySuccess, error: replyError } = commentValidator(
      'Reply',
      2000,
      10
    ).safeParse(reply);

    if (!replySuccess) {
      return res.status(400).json({ message: replyError?.issues[0]?.message });
    }

    const [approveMainComment, createReply] = await Promise.all([
      prisma.comment.update({
        where: { id: commentId },
        data: { isApproved: true },
      }),
      prisma.comment.create({
        data: {
          userId: req.user?.id as string,
          courseId: comment.courseId,
          sessionId: comment.sessionId,
          comment: reply,
          isItReply: true,
          isApproved: true,
          replyTo: commentId,
        },
      }),
    ]);

    if (!approveMainComment || !createReply) {
      return res
        .status(400)
        .json({ message: 'Failed to reply to comment, try again later' });
    }

    return res.status(200).json({ message: 'Comment replied successfully' });
  } catch (error) {
    console.error('Error replying to comment', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  banUser,
  unBanUser,
  getAllUsers,
  deleteUser,
  updateUserRole,
  deleteCourseByCourseId,
  getAllNotApprovedComments,
  approveComment,
  deleteComment,
  replyToComment,
};
