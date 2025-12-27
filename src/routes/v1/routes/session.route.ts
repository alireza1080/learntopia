import {
  createSession,
  getAllSessions,
  getSessionById,
  getSessionsByCourseId,
} from 'controllers/v1/session.controller.ts';
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

router.get(
  '/get-all',
  accessByLevelMiddleware(
    [3, 2],
    'Only admins and teachers are allowed to get all sessions'
  ),
  getAllSessions
);

router.get('/get-by-id/:sessionId', getSessionById);

router.get('/get-by-course-id/:courseId', getSessionsByCourseId);

export default router;
