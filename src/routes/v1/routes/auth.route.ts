import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
} from '../../../controllers/v1/auth.controller.ts';
import accessByLevelMiddleware from 'middlewares/accessByLevel.middleware.ts';

const router = Router();

router.post('/register',accessByLevelMiddleware([0], 'You should be logged out to register'), register);
router.post('/login',accessByLevelMiddleware([0], 'You should be logged out to login'), login);
router.post('/logout',accessByLevelMiddleware([1, 2, 3], 'You should be logged in to logout'), logout);
router.get('/me',accessByLevelMiddleware([1, 2, 3], 'You should be logged in to get your profile'), me);

export default router;
