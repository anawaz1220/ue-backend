import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config();

// Railway provides DATABASE_URL, but we also support individual variables for local development
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL 
    ? {
        url: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'urban_ease',
      }
  ),
  synchronize: !isProduction, // Only sync in development
  logging: !isProduction,
  entities: [
    path.join(__dirname, '../entities/**/*.{ts,js}')
  ],
  migrations: [
    path.join(__dirname, '../migrations/**/*.{ts,js}')
  ],
  subscribers: [
    path.join(__dirname, '../subscribers/**/*.{ts,js}')
  ]
});

// Test database connection
export const testConnection = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};