import { Not } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { CustomerProfile } from '../entities/CustomerProfile.entity';
import { CustomerAddress } from '../entities/CustomerAddress.entity';
import { AppError } from '../middlewares/error.middleware';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private customerProfileRepository = AppDataSource.getRepository(CustomerProfile);
  private customerAddressRepository = AppDataSource.getRepository(CustomerAddress);

  /**
   * Get current user profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      const user = await this.userRepository.findOne({ 
        where: { id: userId },
        relations: ['customer_profile', 'business_profile'] 
      });

      if (!user) {
        const error: AppError = new Error('User not found');
        error.statusCode = 404;
        return next(error);
      }

      // Create a safe user object without sensitive information
      const safeUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        is_email_verified: user.is_email_verified,
        google_id: user.google_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login,
        customer_profile: user.customer_profile,
        business_profile: user.business_profile
      };

      res.status(200).json({
        success: true,
        data: safeUser
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update customer profile
   */
  updateCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { firstName, lastName, phoneNumber, whatsappNumber, profilePhotoUrl } = req.body;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      const customerProfile = await this.customerProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!customerProfile) {
        const error: AppError = new Error('Customer profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Update profile
      if (firstName) customerProfile.first_name = firstName;
      if (lastName) customerProfile.last_name = lastName;
      if (phoneNumber) customerProfile.phone_number = phoneNumber;
      if (whatsappNumber !== undefined) customerProfile.whatsapp_number = whatsappNumber;
      if (profilePhotoUrl !== undefined) customerProfile.profile_photo_url = profilePhotoUrl;

      await this.customerProfileRepository.save(customerProfile);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: customerProfile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add customer address
   */
  addCustomerAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { house, street, city, isDefault } = req.body;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      // Find customer profile
      const customerProfile = await this.customerProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!customerProfile) {
        const error: AppError = new Error('Customer profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Create new address
      const address = new CustomerAddress();
      address.customer_id = customerProfile.id;
      address.house = house;
      address.street = street;
      address.city = city;
      address.is_default = isDefault || false;

      // If this is the default address, update all other addresses
      if (address.is_default) {
        await this.customerAddressRepository.update(
          { customer_id: customerProfile.id, is_default: true },
          { is_default: false }
        );
      }

      await this.customerAddressRepository.save(address);

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: address
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer addresses
   */
  getCustomerAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      // Find customer profile
      const customerProfile = await this.customerProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!customerProfile) {
        const error: AppError = new Error('Customer profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Get addresses
      const addresses = await this.customerAddressRepository.find({
        where: { customer_id: customerProfile.id }
      });

      res.status(200).json({
        success: true,
        data: addresses
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update customer address
   */
  updateCustomerAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { addressId } = req.params;
      const { house, street, city, isDefault } = req.body;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      // Find customer profile
      const customerProfile = await this.customerProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!customerProfile) {
        const error: AppError = new Error('Customer profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Find address
      const address = await this.customerAddressRepository.findOne({
        where: { id: addressId, customer_id: customerProfile.id }
      });

      if (!address) {
        const error: AppError = new Error('Address not found');
        error.statusCode = 404;
        return next(error);
      }

      // Update address
      if (house !== undefined) address.house = house;
      if (street !== undefined) address.street = street;
      if (city !== undefined) address.city = city;
      
      // Handle default address
      if (isDefault !== undefined && isDefault !== address.is_default) {
        address.is_default = isDefault;
        
        // If this is the new default, update all other addresses
        if (isDefault) {
          await this.customerAddressRepository.update(
            { customer_id: customerProfile.id, is_default: true, id: Not(addressId) },
            { is_default: false }
          );
        }
      }

      await this.customerAddressRepository.save(address);

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: address
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete customer address
   */
  deleteCustomerAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { addressId } = req.params;

      if (!userId) {
        const error: AppError = new Error('User ID not found');
        error.statusCode = 401;
        return next(error);
      }

      // Find customer profile
      const customerProfile = await this.customerProfileRepository.findOne({
        where: { user_id: userId }
      });

      if (!customerProfile) {
        const error: AppError = new Error('Customer profile not found');
        error.statusCode = 404;
        return next(error);
      }

      // Find address
      const address = await this.customerAddressRepository.findOne({
        where: { id: addressId, customer_id: customerProfile.id }
      });

      if (!address) {
        const error: AppError = new Error('Address not found');
        error.statusCode = 404;
        return next(error);
      }

      // Delete address
      await this.customerAddressRepository.remove(address);

      res.status(200).json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}