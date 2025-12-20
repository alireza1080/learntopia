import { Router } from 'express';
import authRoutes from './routes/auth.route.ts';
import adminRoutes from './routes/admin.route.ts';
import authMiddleware from 'middlewares/auth.middleware.ts';
import roleLevelMiddleware from 'middlewares/roleLevel.middleware.ts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', authMiddleware, roleLevelMiddleware, adminRoutes);

export default router;
