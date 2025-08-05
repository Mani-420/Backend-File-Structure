import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile
} from '../app/controllers/userController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// Protected routes
router.route('/profile').get(verifyJWT, getUserProfile);

export default router;
