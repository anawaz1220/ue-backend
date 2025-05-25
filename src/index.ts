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

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourproductiondomain.com' 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);



// Setup Swagger
setupSwagger(app);

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');
    
    // Start express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();