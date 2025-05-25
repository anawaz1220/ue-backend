import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || ''
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
    const result = await transporter.sendMail({
      from: options.from || process.env.FROM_EMAIL || 'urbanease2@gmail.com',
      to: options.to,
      subject: options.subject,
      html: options.html
    });
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// The rest of your email functions can remain the same
export const generateVerificationEmail = (
  email: string,
  token: string
): EmailOptions => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  return {
    to: email,
    subject: 'Verify Your Urban Ease Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Urban Ease!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not sign up for Urban Ease, please ignore this email.</p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `
  };
};