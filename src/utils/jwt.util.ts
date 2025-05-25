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

  // Get secrets with fallbacks
  const accessSecret = process.env.JWT_ACCESS_SECRET || 'your_access_secret_here';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_here';

  // Use numeric values for expiresIn (seconds)
  const accessExpirationSeconds = 15 * 60; // 15 minutes
  const refreshExpirationSeconds = 7 * 24 * 60 * 60; // 7 days

  // Generate tokens with numeric expiration
  const accessToken = jwt.sign(
    payload,
    accessSecret,
    { expiresIn: accessExpirationSeconds }
  );

  const refreshToken = jwt.sign(
    payload,
    refreshSecret,
    { expiresIn: refreshExpirationSeconds }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: accessExpirationSeconds
  };
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'your_access_secret_here';
    const decoded = jwt.verify(token, accessSecret);
    return decoded as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_here';
    const decoded = jwt.verify(token, refreshSecret);
    return decoded as TokenPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};