import express, {
  Application,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import userRouter from './routers/userRouter';
import musicRouter from './routers/musicRouter';
import connectDB from './config/database';
import { ApiResponse } from './types';

// Load environment variables
dotenv.config();


const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Connect to MongoDB
connectDB();

// --------------------
// Security middleware
// --------------------
app.use(helmet());

// --------------------
// CORS Configuration
// --------------------
const rawOrigins: string = process.env.CORS_ORIGIN || '';
const allowedOrigins: string[] = rawOrigins
  .split(',')
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

// Default to localhost for development
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push(process.env.CORS_ORIGIN_DEV || 'cross');
}

console.log('🌍 Allowed Origins:', allowedOrigins);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-site or tools like Postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// --------------------
// Rate Limiting
// --------------------
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

// --------------------
// Static & Logging
// --------------------
app.use('/uploads', express.static('uploads'));
app.use('/api/', limiter);
app.use(morgan('combined'));

// --------------------
// Body Parsers
// --------------------
// ✅ Skip JSON parsing for multipart/form-data requests
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.is('multipart/form-data')) {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --------------------
// Routes
// --------------------
app.use('/api/users', userRouter);
app.use('/api/music', musicRouter);

// Health check
app.get('/api/health', (req: Request, res: Response<ApiResponse>) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Root
app.get('/api', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: 'Welcome to Spicy Music Backend API',
    data: {
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        users: '/api/users',
        music: '/api/music',
      },
    },
  });
});

// 404
app.use('*', (req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: { path: req.originalUrl },
  });
});

// --------------------
// Error Handler
// --------------------
const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction,
): void => {
  if (err.message === 'CORS origin not allowed') {
    res.status(403).json({
      success: false,
      message: 'CORS origin not allowed',
    });
    return;
  }

  console.error('Error:', err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      data: { stack: err.stack ?? '' },
    }),
  });
};

app.use(errorHandler);

// --------------------
// Graceful Shutdown
// --------------------
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// --------------------
// Start Server
// --------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: /api/health`);
});

export default app;
