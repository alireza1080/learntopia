import { Router } from 'express';
import { createCourse } from '../../../controllers/v1/course.controller.ts';

const router = Router();

router.post('/create', createCourse);

export default router;