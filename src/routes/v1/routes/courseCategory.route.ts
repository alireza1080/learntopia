import { Router } from 'express';
import {
  createCourseCategory,
  getAllCourseCategories,
  editCourseCategory,
} from 'controllers/v1/courseCategory.controller.ts';
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

router.put(
  '/edit/:id',
  accessByLevelMiddleware(
    [3],
    'Only admins is allowed to edit a course category'
  ),
  editCourseCategory
);

router.get('/get-all', getAllCourseCategories);

export default router;
