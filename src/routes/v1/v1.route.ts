import { Router } from 'express';
import userRoutes from './routes/user.route.ts';
import authRoutes from './routes/auth.route.ts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);

export default router;