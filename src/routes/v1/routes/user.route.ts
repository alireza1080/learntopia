import { Router } from 'express';
import { updatePassword } from 'controllers/v1/user.controller.ts';

const router = Router();

router.patch('/update-password', updatePassword);

export default router;
