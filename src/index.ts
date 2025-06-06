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

// CORS configuration - Enhanced for Railway + Vercel
const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Production domains
      'https://ue-frontend.vercel.app',
      'https://ue-frontend-production.up.railway.app',
      process.env.FRONTEND_URL,
      
      // Development domains  
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173',
      'http://localhost:60476',
      
      // Additional Railway/Vercel patterns
      ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
    ].filter(Boolean);
    
    console.log(`🔍 CORS Check - Origin: ${origin}, Environment: ${process.env.NODE_ENV}`);
    
    // Check exact matches first
    const isExactMatch = allowedOrigins.includes(origin);
    
    // Check pattern matches for Vercel preview deployments and Railway
    const isPatternMatch = /^https:\/\/.*\.vercel\.app$/.test(origin) ||
                          /^https:\/\/.*\.railway\.app$/.test(origin) ||
                          /^https:\/\/.*\.netlify\.app$/.test(origin);
    
    const isAllowed = isExactMatch || isPatternMatch;
    
    if (isAllowed) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}. Allowed origins:`, allowedOrigins);
      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    }
  },
  credentials: false, // Set to false for JWT-based auth (no cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Add this before your routes to debug CORS
app.use((req, res, next) => {
  console.log(`🌐 Request from origin: ${req.headers.origin || 'no-origin'}`);
  next();
});

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
        // Wait a moment for database to be fully ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { default: seedFunction } = await import('./utils/seed');
        await seedFunction();
        console.log('✅ Database seeded successfully');
      } catch (seedError) {
        console.log('ℹ️  Seed failed (this is normal for existing data):', (seedError as Error).message);
        // Don't exit on seed failure in production
      }
    }
    
    // Start express server
    app.listen(Number(PORT), () => {
      const baseUrl = isProduction 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.railway.app'}` 
        : `http://localhost:${PORT}`;
        
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📚 API Documentation: ${baseUrl}/api-docs`);
      console.log(`🏥 Health Check: ${baseUrl}/health`);
      console.log(`🌐 Base URL: ${baseUrl}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();