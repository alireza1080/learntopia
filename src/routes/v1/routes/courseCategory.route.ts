import { Router } from 'express';
import {
  createCourseCategory,
  getAllCourseCategories,
  editCourseCategory,
  deleteCourseCategory,
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

router.delete(
  '/delete/:id',
  accessByLevelMiddleware(
    [3],
    'Only admins is allowed to delete a course category'
  ),
  deleteCourseCategory
);
router.get('/get-all', getAllCourseCategories);

export default router;
