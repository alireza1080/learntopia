import { Router } from 'express';
import authRoutes from './routes/auth.route.ts';
import adminRoutes from './routes/admin.route.ts';
import authMiddleware from 'middlewares/auth.middleware.ts';
import roleLevelMiddleware from 'middlewares/roleLevel.middleware.ts';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';

const router = Router();

router.use('/auth', authRoutes);
router.use(
  '/admin',
  authMiddleware,
  roleLevelMiddleware,
  accessByLevelMiddleware([3], 'Only admins is allowed to ban a user'),
  adminRoutes
);

export default router;
