import { Router } from 'express';
import { createUser, deleteUser } from '../../../controllers/v1/user.controller.ts';

const router = Router();

router.post('/create', createUser);
router.delete('/delete/:targetUserId', deleteUser);

export default router;