import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middlewares/error.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new customer
   */
  registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, phoneNumber } = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName || !phoneNumber) {
        const error: AppError = new Error('All fields are required');
        error.statusCode = 400;
        return next(error);
      }

      // Password validation
      if (password.length < 8) {
        const error: AppError = new Error('Password must be at least 8 characters');
        error.statusCode = 400;
        return next(error);
      }

      const user = await this.authService.registerCustomer(
        email,
        password,
        firstName,
        lastName,
        phoneNumber
      );

      res.status(201).json({
        success: true,
        message: 'Customer registered successfully. Please verify your email.',
        data: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Register a new business
   */
  registerBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        email,
        password,
        businessName,
        phoneNumber,
        ownerName,
        ownerPhone,
        building,
        street,
        city
      } = req.body;

      // Validate input
      if (
        !email || !password || !businessName || !phoneNumber ||
        !ownerName || !ownerPhone || !building || !street || !city
      ) {
        const error: AppError = new Error('All fields are required');
        error.statusCode = 400;
        return next(error);
      }

      // Password validation
      if (password.length < 8) {
        const error: AppError = new Error('Password must be at least 8 characters');
        error.statusCode = 400;
        return next(error);
      }

      const user = await this.authService.registerBusiness(
        email,
        password,
        businessName,
        phoneNumber,
        ownerName,
        ownerPhone,
        building,
        street,
        city
      );

      res.status(201).json({
        success: true,
        message: 'Business registered successfully. Please verify your email.',
        data: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        const error: AppError = new Error('Email and password are required');
        error.statusCode = 400;
        return next(error);
      }

      const { user, tokens } = await this.authService.login(email, password);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;

      if (!token) {
        const error: AppError = new Error('Verification token is required');
        error.statusCode = 400;
        return next(error);
      }

      await this.authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully. You can now login.'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request password reset
   */
  requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email) {
        const error: AppError = new Error('Email is required');
        error.statusCode = 400;
        return next(error);
      }

      await this.authService.initiatePasswordReset(email);

      res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive password reset instructions.'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        const error: AppError = new Error('Token and new password are required');
        error.statusCode = 400;
        return next(error);
      }

      // Password validation
      if (newPassword.length < 8) {
        const error: AppError = new Error('Password must be at least 8 characters');
        error.statusCode = 400;
        return next(error);
      }

      await this.authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh token
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        const error: AppError = new Error('Refresh token is required');
        error.statusCode = 401;
        return next(error);
      }

      const tokens = await this.authService.refreshToken(refreshToken);

      // Set new refresh token in HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user
   */
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend verification email
   */
  resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email) {
        const error: AppError = new Error('Email is required');
        error.statusCode = 400;
        return next(error);
      }

      await this.authService.resendVerificationEmail(email);

      res.status(200).json({
        success: true,
        message: 'If your email is registered and not verified, a new verification email has been sent.'
      });
    } catch (error) {
      next(error);
    }
  };
}