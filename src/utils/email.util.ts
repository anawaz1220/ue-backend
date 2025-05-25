// Description: Utility functions for sending emails using Gmail SMTP
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'urbanease2@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'kwlxbapkwiwnrueh'
  }
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: options.from || process.env.FROM_EMAIL || 'urbanease2@gmail.com',
      to: options.to,
      subject: options.subject,
      html: options.html
    });
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export const generateVerificationEmail = (
  email: string,
  token: string
): EmailOptions => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  return {
    to: email,
    subject: 'Verify Your Urban Ease Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4CAF50;">Urban Ease</h1>
        </div>
        <h2>Welcome to Urban Ease!</h2>
        <p>Thank you for signing up for Urban Ease - your beauty and wellness service platform.</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">If you did not sign up for Urban Ease, please ignore this email.</p>
        <p style="color: #666; font-size: 12px;">© 2025 Urban Ease. All rights reserved.</p>
      </div>
    `
  };
};

export const generatePasswordResetEmail = (
  email: string,
  token: string
): EmailOptions => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  return {
    to: email,
    subject: 'Reset Your Urban Ease Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4CAF50;">Urban Ease</h1>
        </div>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for your Urban Ease account.</p>
        <p>Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
        <p style="color: #666; font-size: 12px;">© 2025 Urban Ease. All rights reserved.</p>
      </div>
    `
  };
};