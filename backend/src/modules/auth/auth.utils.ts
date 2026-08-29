import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config/index.js';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT access token (short-lived).
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
}

/**
 * Generate a random refresh token string.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Hash a refresh token for storage (we never store the raw token).
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Calculate expiry date for refresh token.
 */
export function getRefreshExpiry(): Date {
  const expiresIn = config.jwt.refreshExpiresIn;
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    // Default: 7 days
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  
  return new Date(Date.now() + value * multipliers[unit]);
}
