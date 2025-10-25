import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import userRouter from './routers/userRouter';
import musicRouter from './routers/musicRouter';

import connectDB from './config/database';
import { ApiResponse } from './types';
import { ErrorRequestHandler } from 'express';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const rawOrigins = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean); // allow comma separated list in env

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // If no origin (e.g., same-site requests, curl, Postman) allow it
    if (!origin) return callback(null, true);

    // If no allowedOrigins configured, block cross-origin requests by default
    if (allowedOrigins.length === 0) {
      return callback(new Error('CORS origin not allowed'), false);
    }

    // Allow if origin matches one of the allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Not allowed
    return callback(new Error('CORS origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Apply CORS globally so preflight and normal requests are handled
app.use(cors(corsOptions));
// Also explicitly respond to OPTIONS with the same CORS options
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // default 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // default 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// To access images via URLs
app.use('/uploads', express.static('uploads'));

// Apply rate limiter to API routes
app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/users', userRouter);
app.use('/api/music', musicRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response<ApiResponse>) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

// Root endpoint
app.get('/api', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: 'Welcome to Spicy Music Backend API',
    data: {
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        users: '/api/users',
        music: '/api/music'
      }
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: {
      path: req.originalUrl
    }
  });
});

// Global error handler typed as ErrorRequestHandler to satisfy TS
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // If the error came from CORS origin check, respond with 403
  if (err && (err.message === 'CORS origin not allowed' || (err as any).code === 'ERR_CORS_NOT_ALLOWED')) {
    return res.status(403).json({
      success: false,
      message: 'CORS origin not allowed'
    });
  }

  console.error('Error:', err);

  return res.status(500).json({
    success: false,
    message: (err && (err as Error).message) || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: (err && (err as any).stack) })
  });
};

app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check:  /api/health`);
});

export default app;
