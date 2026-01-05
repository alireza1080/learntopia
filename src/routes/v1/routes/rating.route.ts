import { Router } from 'express';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';
import createRating from 'controllers/v1/rating.controller.ts';

const router = Router();

router.post(
  '/create/:courseId',
  accessByLevelMiddleware(
    [1, 2, 3],
    'You should be logged in to create a rating'
  ),
  createRating
);

export default router;
