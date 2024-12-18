import { Router } from 'express';
import { getAllCourses, getLectureByCourseId } from '../controllers/course.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/')
    .get(getAllCourses);

router.route('/:id')
    .get(isLoggedIn, getLectureByCourseId);

export default router;