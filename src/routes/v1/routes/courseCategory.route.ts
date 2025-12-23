import { Router } from 'express';
import { createCourseCategory } from 'controllers/v1/courseCategory.controller.ts';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';

const router = Router();

router.post(
  '/create',
  accessByLevelMiddleware(
    [3],
    'Only admins is allowed to create a course category'
  ),
  createCourseCategory
);

export default router;
