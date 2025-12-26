import { Router } from 'express';
import authRoutes from './routes/auth.route.ts';
import adminRoutes from './routes/admin.route.ts';
import authMiddleware from 'middlewares/auth.middleware.ts';
import roleLevelMiddleware from 'middlewares/roleLevel.middleware.ts';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';
import userRoutes from './routes/user.route.ts';
import courseCategoryRoutes from './routes/courseCategory.route.ts';
import courseRoutes from './routes/course.route.ts';

const router = Router();

router.use('/auth',authMiddleware, roleLevelMiddleware, authRoutes);

router.use('/admin', authMiddleware, roleLevelMiddleware, adminRoutes);

router.use(
  '/user',
  authMiddleware,
  roleLevelMiddleware,
  accessByLevelMiddleware([1, 2, 3], 'Log in to use this feature'),
  userRoutes
);

router.use('/course-category', authMiddleware, roleLevelMiddleware, courseCategoryRoutes);

router.use('/course', authMiddleware, roleLevelMiddleware, courseRoutes);

export default router;
