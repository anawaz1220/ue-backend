import { MoreThan } from 'typeorm';
import { verifyRefreshToken } from '../utils/jwt.util';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User.entity';
import { generateTokens, TokenResponse } from '../utils/jwt.util';
import { sendEmail, generateVerificationEmail, generatePasswordResetEmail } from '../utils/email.util';
import { CustomerProfile } from '../entities/CustomerProfile.entity';
import { BusinessProfile } from '../entities/BusinessProfile.entity';

export class AuthService {
  private userRepository: Repository<User>;
  private customerProfileRepository: Repository<CustomerProfile>;
  private businessProfileRepository: Repository<BusinessProfile>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.customerProfileRepository = AppDataSource.getRepository(CustomerProfile);
    this.businessProfileRepository = AppDataSource.getRepository(BusinessProfile);
  }

  /**
   * Register a new customer
   */
  async registerCustomer(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User();
    user.email = email;
    user.password_hash = password;
    user.role = UserRole.CUSTOMER;
    user.verification_token = verificationToken;
    user.is_email_verified = false;

    const savedUser = await this.userRepository.save(user);

    // Create customer profile
    const customerProfile = new CustomerProfile();
    customerProfile.user_id = savedUser.id;
    customerProfile.first_name = firstName;
    customerProfile.last_name = lastName;
    customerProfile.phone_number = phoneNumber;
    
    await this.customerProfileRepository.save(customerProfile);

    // Send verification email
    const emailOptions = generateVerificationEmail(email, verificationToken);
    await sendEmail(emailOptions);

    return savedUser;
  }

  /**
   * Register a new business
   */
  async registerBusiness(
    email: string,
    password: string,
    businessName: string,
    phoneNumber: string,
    ownerName: string,
    ownerPhone: string,
    building: string,
    street: string,
    city: string
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User();
    user.email = email;
    user.password_hash = password;
    user.role = UserRole.BUSINESS;
    user.verification_token = verificationToken;
    user.is_email_verified = false;

    const savedUser = await this.userRepository.save(user);

    // Create business profile
    const businessProfile = new BusinessProfile();
    businessProfile.user_id = savedUser.id;
    businessProfile.business_name = businessName;
    businessProfile.phone_number = phoneNumber;
    businessProfile.owner_name = ownerName;
    businessProfile.owner_phone = ownerPhone;
    businessProfile.building = building;
    businessProfile.street = street;
    businessProfile.city = city;
    
    await this.businessProfileRepository.save(businessProfile);

    // Send verification email
    const emailOptions = generateVerificationEmail(email, verificationToken);
    await sendEmail(emailOptions);

    return savedUser;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{user: User, tokens: TokenResponse}> {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!user.is_email_verified) {
      throw new Error('Email not verified. Please verify your email to login.');
    }

    // Update last login
    user.last_login = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = generateTokens(user);

    return { user, tokens };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    // Find user by verification token
    const user = await this.userRepository.findOne({ where: { verification_token: token } });
    if (!user) {
      throw new Error('Invalid verification token');
    }

    // Update user - Fix for TypeScript strict mode
    user.is_email_verified = true;
    user.verification_token = undefined;
    await this.userRepository.save(user);

    return true;
  }

  /**
   * Initiate password reset
   */
  async initiatePasswordReset(email: string): Promise<boolean> {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // For security reasons, don't indicate if email exists
      return true;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Token expires in 1 hour

    // Update user
    user.reset_password_token = resetToken;
    user.reset_password_expires = expiryDate;
    await this.userRepository.save(user);

    // Send password reset email
    const emailOptions = generatePasswordResetEmail(email, resetToken);
    await sendEmail(emailOptions);

    return true;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find user by reset token
    const user = await this.userRepository.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: MoreThan(new Date())
      }
    });
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password - Fix for TypeScript strict mode
    user.password_hash = newPassword;
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await this.userRepository.save(user);

    return true;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findOne({ where: { id: payload.userId } });
    
    if (!user) {
      throw new Error('User not found');
    }

    return generateTokens(user);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<boolean> {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // For security reasons, don't indicate if email exists
      return true;
    }

    // Check if already verified
    if (user.is_email_verified) {
      throw new Error('Email already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verification_token = verificationToken;
    await this.userRepository.save(user);

    // Send verification email
    const emailOptions = generateVerificationEmail(email, verificationToken);
    await sendEmail(emailOptions);

    return true;
  }
}