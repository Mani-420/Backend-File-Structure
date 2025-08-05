import { Router } from 'express';
import {
  createTask,
  getUserTasks,
  getTask,
  updateTask,
  deleteTask
} from '../app/controllers/taskController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT); // Apply JWT verification to all routes

router.route('/').get(getUserTasks).post(createTask);

router.route('/:taskId').get(getTask).put(updateTask).delete(deleteTask);

export default router;
