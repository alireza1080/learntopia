import { Router } from 'express';
import { banUser, unBanUser } from 'controllers/v1/admin.controller.ts';

const router = Router();

router.post('/ban-user/:violatorId', banUser);
router.post('/unban-user/:violatorId', unBanUser);

export default router;
