import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { BusinessProfile } from '../entities/BusinessProfile.entity';
import { BusinessPhoto } from '../entities/BusinessPhoto.entity';
import { BusinessService } from '../entities/BusinessService.entity';
import { ServiceType } from '../entities/ServiceType.entity';
import { AppError } from '../middlewares/error.middleware';

export class BusinessController {
  private userRepository = AppDataSource.getRepository(User);
  private businessProfileRepository = AppDataSource.getRepository(BusinessProfile);
  private businessPhotoRepository = AppDataSource.getRepository(BusinessPhoto);
  private businessServiceRepository = AppDataSource.getRepository(BusinessService);
  private serviceTypeRepository = AppDataSource.getRepository(ServiceType);

  /**
   * Update business profile
   */
  updateBusinessProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const {
        businessName,
        phoneNumber,
        whatsappNumber,
        instagramId,
        ownerName,
        ownerPhone,
        building,
        street,
        city,
        latitude,
        longitude
      } = req.body;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      const businessProfile = await this.businessProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!businessProfile) {
        const error: AppError = new Error('Business profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Update profile
      if (businessName) businessProfile.business_name = businessName;
      if (phoneNumber) businessProfile.phone_number = phoneNumber;
      if (whatsappNumber !== undefined) businessProfile.whatsapp_number = whatsappNumber;
      if (instagramId !== undefined) businessProfile.instagram_id = instagramId;
      if (ownerName) businessProfile.owner_name = ownerName;
      if (ownerPhone) businessProfile.owner_phone = ownerPhone;
      if (building) businessProfile.building = building;
      if (street) businessProfile.street = street;
      if (city) businessProfile.city = city;
      if (latitude !== undefined) businessProfile.latitude = latitude;
      if (longitude !== undefined) businessProfile.longitude = longitude;

      await this.businessProfileRepository.save(businessProfile);

      res.status(200).json({
        success: true,
        message: 'Business profile updated successfully',
        data: businessProfile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add business photo
   */
  addBusinessPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { photoUrl } = req.body;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      if (!photoUrl) {
        const error: AppError = new Error('Photo URL is required');
        error.statusCode = 400;
        return next(error);
      }

      // Find business profile
      const businessProfile = await this.businessProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!businessProfile) {
        const error: AppError = new Error('Business profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Create new photo
      const photo = new BusinessPhoto();
      photo.business_id = businessProfile.id;
      photo.photo_url = photoUrl;

      await this.businessPhotoRepository.save(photo);

      res.status(201).json({
        success: true,
        message: 'Photo added successfully',
        data: photo
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get business photos
   */
  getBusinessPhotos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      // Find business profile
      const businessProfile = await this.businessProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!businessProfile) {
        const error: AppError = new Error('Business profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Get photos
      const photos = await this.businessPhotoRepository.find({
        where: { business_id: businessProfile.id }
      });

      res.status(200).json({
        success: true,
        data: photos
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete business photo
   */
  deleteBusinessPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { photoId } = req.params;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      // Find business profile
      const businessProfile = await this.businessProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!businessProfile) {
        const error: AppError = new Error('Business profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Find photo
      const photo = await this.businessPhotoRepository.findOne({
        where: { id: photoId, business_id: businessProfile.id }
      });

      if (!photo) {
        const error: AppError = new Error('Photo not found');
        error.statusCode = 404;
        return next(error);
      }

      // Delete photo
      await this.businessPhotoRepository.remove(photo);

      res.status(200).json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all service types
   */
  getServiceTypes = async (req: Request, res: Response, next: NextFunction) => {
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
   * Add business service
   */
  addBusinessService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { serviceTypeId } = req.body;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      if (!serviceTypeId) {
        const error: AppError = new Error('Service type ID is required');
        error.statusCode = 400;
        return next(error);
      }

      // Find business profile
      const businessProfile = await this.businessProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!businessProfile) {
        const error: AppError = new Error('Business profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Check if service type exists
      const serviceType = await this.serviceTypeRepository.findOne({
        where: { id: serviceTypeId }
      });

      if (!serviceType) {
        const error: AppError = new Error('Service type not found');
        error.statusCode = 404;
        return next(error);
      }

      // Check if service already exists
      const existingService = await this.businessServiceRepository.findOne({
        where: { business_id: businessProfile.id, service_type_id: serviceTypeId }
      });

      if (existingService) {
        const error: AppError = new Error('Service already added');
        error.statusCode = 400;
        return next(error);
      }

      // Create new service
      const service = new BusinessService();
      service.business_id = businessProfile.id;
      service.service_type_id = serviceTypeId;

      await this.businessServiceRepository.save(service);

      res.status(201).json({
        success: true,
        message: 'Service added successfully',
        data: service
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get business services
   */
  getBusinessServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      // Find business profile
      const businessProfile = await this.businessProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!businessProfile) {
        const error: AppError = new Error('Business profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Get services with service type info
      const services = await this.businessServiceRepository.find({
        where: { business_id: businessProfile.id },
        relations: ['service_type']
      });

      res.status(200).json({
        success: true,
        data: services
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete business service
   */
  deleteBusinessService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { serviceId } = req.params;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      // Find business profile
      const businessProfile = await this.businessProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!businessProfile) {
        const error: AppError = new Error('Business profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Find service
      const service = await this.businessServiceRepository.findOne({
        where: { id: serviceId, business_id: businessProfile.id }
      });

      if (!service) {
        const error: AppError = new Error('Service not found');
        error.statusCode = 404;
        return next(error);
      }

      // Delete service
      await this.businessServiceRepository.remove(service);

      res.status(200).json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}