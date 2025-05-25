import { Not } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User.entity';
import { ServiceType } from '../entities/ServiceType.entity';
import { AppError } from '../middlewares/error.middleware';

export class AdminController {
  private userRepository = AppDataSource.getRepository(User);
  private serviceTypeRepository = AppDataSource.getRepository(ServiceType);

  /**
   * Get all users
   */
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userRepository.find({
        select: [
          'id', 'email', 'role', 'is_email_verified', 'google_id',
          'created_at', 'updated_at', 'last_login'
        ]
      });

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['customer_profile', 'business_profile'],
        select: [
          'id', 'email', 'role', 'is_email_verified', 'google_id',
          'created_at', 'updated_at', 'last_login'
        ]
      });

      if (!user) {
        const error: AppError = new Error('User not found');
        error.statusCode = 404;
        return next(error);
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create service type
   */
  createServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;

      if (!name) {
        const error: AppError = new Error('Service type name is required');
        error.statusCode = 400;
        return next(error);
      }

      // Check if service type already exists
      const existingServiceType = await this.serviceTypeRepository.findOne({
        where: { name }
      });

      if (existingServiceType) {
        const error: AppError = new Error('Service type already exists');
        error.statusCode = 400;
        return next(error);
      }

      // Create new service type
      const serviceType = new ServiceType();
      serviceType.name = name;

      await this.serviceTypeRepository.save(serviceType);

      res.status(201).json({
        success: true,
        message: 'Service type created successfully',
        data: serviceType
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all service types
   */
  getAllServiceTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceTypes = await this.serviceTypeRepository.find();

      res.status(200).json({
        success: true,
        data: serviceTypes
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update service type
   */
  updateServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceTypeId } = req.params;
      const { name } = req.body;

      if (!name) {
        const error: AppError = new Error('Service type name is required');
        error.statusCode = 400;
        return next(error);
      }

      // Find service type
      const serviceType = await this.serviceTypeRepository.findOne({
        where: { id: serviceTypeId }
      });

      if (!serviceType) {
        const error: AppError = new Error('Service type not found');
        error.statusCode = 404;
        return next(error);
      }

      // Check if another service type with the same name exists
      const existingServiceType = await this.serviceTypeRepository.findOne({
        where: { name, id: Not(serviceTypeId) }
      });

      if (existingServiceType) {
        const error: AppError = new Error('Another service type with this name already exists');
        error.statusCode = 400;
        return next(error);
      }

      // Update service type
      serviceType.name = name;

      await this.serviceTypeRepository.save(serviceType);

      res.status(200).json({
        success: true,
        message: 'Service type updated successfully',
        data: serviceType
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete service type
   */
  deleteServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceTypeId } = req.params;

      // Find service type
      const serviceType = await this.serviceTypeRepository.findOne({
        where: { id: serviceTypeId }
      });

      if (!serviceType) {
        const error: AppError = new Error('Service type not found');
        error.statusCode = 404;
        return next(error);
      }

      // Delete service type
      await this.serviceTypeRepository.remove(serviceType);

      res.status(200).json({
        success: true,
        message: 'Service type deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}