import express, { Router } from 'express';
import { register, login, getProfile, updateProfile, logout } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateRegister, validateLogin, validateUpdateProfile } from '../middleware/validation';
import { upload } from '../middleware/upload';

const userRouter: Router = express.Router();

// Public routes
userRouter.post('/register', validateRegister, register);
userRouter.post('/login', validateLogin, login);

// Protected routes
userRouter.get('/profile', authenticate, getProfile);
userRouter.put('/profile', authenticate, upload.single('profilePic'), validateUpdateProfile, updateProfile);
userRouter.post('/logout', authenticate, logout);

export default userRouter;
