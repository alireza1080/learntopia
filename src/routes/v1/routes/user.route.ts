import { Router } from 'express';
import { deleteUser } from '../../../controllers/v1/user.controller.ts';

const router = Router();

router.delete('/delete/:targetUserId', deleteUser);

export default router;