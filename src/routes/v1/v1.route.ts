import { Router } from 'express';
import userRoutes from './routes/user.route.ts';

const router = Router();

router.use('/user', userRoutes);

export default router;