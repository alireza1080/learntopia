import { Router } from 'express';
import {
  createCourse,
  purchaseCourse,
  getAllCoursesByCategoryId,
  getCourseById,
  getRelatedCourses,
} from '../../../controllers/v1/course.controller.ts';
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

router.post(
  '/purchase/:courseId',
  accessByLevelMiddleware(
    [1, 2, 3],
    'You should be logged in to purchase a course'
  ),
  accessByLevelMiddleware([1], 'You have already purchased this course'),
  purchaseCourse
);

router.get('/category/:categoryId', getAllCoursesByCategoryId);

router.get('/:courseId', getCourseById);

router.get('/related-courses/:courseId/:count', getRelatedCourses);

export default router;
