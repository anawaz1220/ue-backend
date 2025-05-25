import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User.entity';
import { ServiceType } from '../entities/ServiceType.entity';

/**
 * Seed the database with initial data
 */
async function seed() {
  try {
    // Initialize database connection if not already connected
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connection established for seeding');
    }

    // Create repositories
    const userRepository = AppDataSource.getRepository(User);
    const serviceTypeRepository = AppDataSource.getRepository(ServiceType);

    console.log('🌱 Starting database seeding...');

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
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Add default service types for beauty/wellness services
    const defaultServiceTypes = [
      // Hair Services
      'Haircut & Styling',
      'Hair Coloring',
      'Hair Highlights',
      'Hair Treatment',
      'Hair Wash & Blow Dry',
      
      // Nail Services
      'Manicure',
      'Pedicure',
      'Nail Art',
      'Gel Nails',
      'Acrylic Nails',
      
      // Facial & Skin Services
      'Classic Facial',
      'Deep Cleansing Facial',
      'Anti-Aging Facial',
      'Acne Treatment',
      'Skin Consultation',
      
      // Body Services
      'Full Body Massage',
      'Back Massage',
      'Hot Stone Massage',
      'Aromatherapy',
      
      // Beauty Services
      'Makeup Application',
      'Bridal Makeup',
      'Party Makeup',
      'Makeup Consultation',
      
      // Hair Removal
      'Eyebrow Threading',
      'Upper Lip Threading',
      'Full Face Threading',
      'Waxing Services',
      
      // Eye Services
      'Eyebrow Shaping',
      'Eyelash Extensions',
      'Eyelash Tinting',
      'Eyebrow Tinting'
    ];

    let newServicesCount = 0;
    for (const typeName of defaultServiceTypes) {
      const serviceTypeExists = await serviceTypeRepository.findOne({
        where: { name: typeName }
      });

      if (!serviceTypeExists) {
        const serviceType = new ServiceType();
        serviceType.name = typeName;
        await serviceTypeRepository.save(serviceType);
        newServicesCount++;
        console.log(`✅ Service type created: ${typeName}`);
      }
    }

    if (newServicesCount === 0) {
      console.log('ℹ️  All service types already exist');
    } else {
      console.log(`✅ Created ${newServicesCount} new service types`);
    }

    console.log('🎉 Database seeding completed successfully');
    
    // Don't exit process if called from server startup
    if (require.main === module) {
      process.exit(0);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    
    // Don't exit process if called from server startup
    if (require.main === module) {
      process.exit(1);
    }
    
    throw error;
  }
}

// Export as default for ES6 imports
export default seed;

// Run the seed function if this file is executed directly
if (require.main === module) {
  seed();
}