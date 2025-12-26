import { Router } from 'express';
import { createCourse } from '../../../controllers/v1/course.controller.ts';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';

const router = Router();

router.post(
  '/create',
  accessByLevelMiddleware(
    [3, 2],
    'Only admins and teachers are allowed to create a course'
  ),
  createCourse
);

export default router;
