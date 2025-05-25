import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { AppDataSource } from './config/database';
import { setupSwagger } from './config/swagger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import businessRoutes from './routes/business.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middlewares/error.middleware';

// Load environment variables
config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration - simplified for Express 4.x
const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = isProduction 
      ? [
          process.env.FRONTEND_URL,
          // Add your production frontend domains here
        ].filter(Boolean)
      : [
          'http://localhost:3000', 
          'http://localhost:3001',
          'http://localhost:5173' // Vite default port
        ];
    
    // Check if origin is allowed or matches production patterns
    const isAllowed = allowedOrigins.includes(origin) ||
                     (isProduction && (
                       origin.endsWith('.railway.app') ||
                       origin.endsWith('.vercel.app') ||
                       origin.endsWith('.netlify.app')
                     ));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false); // Don't throw error, just deny
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable for Swagger UI
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging in development
if (!isProduction) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Urban Ease API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      business: '/api/business',
      admin: '/api/admin'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);

// Setup Swagger documentation
setupSwagger(app);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Urban Ease API Server...');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Run seed if in production and first deployment
    if (isProduction) {
      try {
        const { default: seedFunction } = await import('./utils/seed');
        await seedFunction();
        console.log('✅ Database seeded successfully');
      } catch (seedError) {
        console.log('ℹ️  Seed already exists or failed (this is normal):', (seedError as Error).message);
      }
    }
    
    // Start express server
    app.listen(Number(PORT), () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();