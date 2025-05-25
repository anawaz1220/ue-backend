import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User.entity';
import { ServiceType } from '../entities/ServiceType.entity';

/**
 * Seed the database with initial data
 */
async function seed() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Create repositories
    const userRepository = AppDataSource.getRepository(User);
    const serviceTypeRepository = AppDataSource.getRepository(ServiceType);

    // Check if admin user exists
    const adminExists = await userRepository.findOne({
      where: { email: 'admin@urbanease.com' }
    });

    if (!adminExists) {
      // Create admin user
      const adminUser = new User();
      adminUser.email = 'admin@urbanease.com';
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      adminUser.password_hash = await bcrypt.hash('Admin@123', salt);
      
      adminUser.role = UserRole.ADMIN;
      adminUser.is_email_verified = true;
      
      await userRepository.save(adminUser);
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Add default service types
    const defaultServiceTypes = [
      'Haircut',
      'Hair Coloring',
      'Manicure',
      'Pedicure',
      'Facial',
      'Massage',
      'Waxing',
      'Makeup',
      'Eyebrows & Lashes'
    ];

    for (const typeName of defaultServiceTypes) {
      const serviceTypeExists = await serviceTypeRepository.findOne({
        where: { name: typeName }
      });

      if (!serviceTypeExists) {
        const serviceType = new ServiceType();
        serviceType.name = typeName;
        await serviceTypeRepository.save(serviceType);
        console.log(`Service type created: ${typeName}`);
      } else {
        console.log(`Service type already exists: ${typeName}`);
      }
    }

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();