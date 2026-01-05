import { Router } from 'express';
import {
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
} from 'controllers/v1/admin.controller.ts';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';

const router = Router();

router.post(
  '/ban-user/:violatorId',
  accessByLevelMiddleware([3], 'Only admins is allowed to ban a user'),
  banUser
);

router.post(
  '/unban-user/:violatorId',
  accessByLevelMiddleware([3], 'Only admins is allowed to unban a user'),
  unBanUser
);

router.get(
  '/get-all-users',
  accessByLevelMiddleware([3], 'Only admins is allowed to get all users'),
  getAllUsers
);

router.delete(
  '/delete-user/:userId',
  accessByLevelMiddleware([3], 'Only admins is allowed to delete a user'),
  deleteUser
);

router.patch(
  '/update-user-role/:userId',
  accessByLevelMiddleware([3], 'Only admins is allowed to promote a user'),
  updateUserRole
);

router.delete(
  '/delete-course/:courseId',
  accessByLevelMiddleware([3], 'Only admins is allowed to delete a course'),
  deleteCourseByCourseId
);

router.get(
  '/get-not-approved-comments/:page/:count',
  accessByLevelMiddleware(
    [3],
    'Only admins is allowed to get all not approved comments'
  ),
  getAllNotApprovedComments
);

router.patch(
  '/approve-comment/:commentId',
  accessByLevelMiddleware([3], 'Only admins is allowed to approve a comment'),
  approveComment
);

router.delete(
  '/delete-comment/:commentId',
  accessByLevelMiddleware([3], 'Only admins is allowed to delete a comment'),
  deleteComment
);

router.post(
  '/reply-to-comment/:commentId',
  accessByLevelMiddleware([3], 'Only admins is allowed to reply to a comment'),
  replyToComment
);

export default router;
