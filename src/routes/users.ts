import express, { Request, Response } from 'express';
import User from '../models/User';
import { ApiResponse, IUserInput, IUserUpdate } from '../types';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req: Request<{}, ApiResponse, IUserInput>, res: Response<ApiResponse>) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req: Request<{ id: string }, ApiResponse, IUserUpdate>, res: Response<ApiResponse>) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// DELETE /api/users/:id - Delete user (soft delete)
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse>) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

export default router;
