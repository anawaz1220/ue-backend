import jwt from 'jsonwebtoken';
import { User } from '../entities/User.entity';

// Types for tokens
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Generate tokens
export const generateTokens = (user: User): TokenResponse => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || 'access_secret',
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 // 15 minutes in seconds
  };
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access_secret'
    );
    return decoded as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    );
    return decoded as TokenPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};