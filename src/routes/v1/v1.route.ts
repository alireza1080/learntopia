import { Router } from 'express';
import authRoutes from './routes/auth.route.ts';
import adminRoutes from './routes/admin.route.ts';
import authMiddleware from 'middlewares/auth.middleware.ts';
import roleLevelMiddleware from 'middlewares/roleLevel.middleware.ts';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';
import userRoutes from './routes/user.route.ts';
import courseCategoryRoutes from './routes/courseCategory.route.ts';
import courseRoutes from './routes/course.route.ts';
import sessionRoutes from './routes/session.route.ts';
import commentRoutes from './routes/comment.route.ts';
import ratingRoutes from './routes/rating.route.ts';

const router = Router();

router.use('/auth', authMiddleware, roleLevelMiddleware, authRoutes);

router.use('/admin', authMiddleware, roleLevelMiddleware, adminRoutes);

router.use('/user', authMiddleware, roleLevelMiddleware, userRoutes);

router.use(
  '/course-category',
  authMiddleware,
  roleLevelMiddleware,
  courseCategoryRoutes
);

router.use('/course', authMiddleware, roleLevelMiddleware, courseRoutes);

router.use('/session', authMiddleware, roleLevelMiddleware, sessionRoutes);

router.use('/comment', authMiddleware, roleLevelMiddleware, commentRoutes);

router.use('/rating', authMiddleware, roleLevelMiddleware, ratingRoutes);

export default router;
