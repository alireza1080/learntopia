import { createComment } from 'controllers/v1/comment.controller.ts';
import { Router } from 'express';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';

const router = Router();

router.post(
  '/create',
  accessByLevelMiddleware(
    [1, 2, 3],
    'You should be logged in to create a comment'
  ),
  createComment
);

export default router;
