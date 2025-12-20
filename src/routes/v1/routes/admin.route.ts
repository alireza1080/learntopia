import { Router } from 'express';
import { banUser, unBanUser } from 'controllers/v1/admin.controller.ts';
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

export default router;
