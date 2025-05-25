import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config();

// Railway provides DATABASE_URL, but we also support individual variables for local development
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  // Production: Use Railway's DATABASE_URL or individual variables
  // Development: Use local database config
  ...(isProduction && process.env.DATABASE_URL 
    ? {
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : isProduction 
    ? {
        // Railway individual variables
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || '5432'),
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: { rejectUnauthorized: false }
      }
    : {
        // Local development
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'urban_ease',
      }
  ),
  synchronize: true, // Enable sync in production for first deployment
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
    console.log(`📍 Connected to: ${isProduction ? 'Railway PostgreSQL' : 'Local PostgreSQL'}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('🔍 Connection details:', {
      isProduction,
      hasDataBaseUrl: !!process.env.DATABASE_URL,
      pgHost: process.env.PGHOST,
      pgPort: process.env.PGPORT,
      pgDatabase: process.env.PGDATABASE
    });
    return false;
  }
};