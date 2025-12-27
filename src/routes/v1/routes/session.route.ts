import { createSession } from 'controllers/v1/session.controller.ts';
import { Router } from 'express';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';

const router = Router();

router.post(
  '/create',
  accessByLevelMiddleware(
    [3, 2],
    'Only admins and teachers are allowed to create a session'
  ),
  createSession
);

export default router;
