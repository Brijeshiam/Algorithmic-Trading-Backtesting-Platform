import bcrypt from 'bcryptjs';
import { query } from '../../config/database.js';
import { AppError } from '../../middleware/error-handler.middleware.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshExpiry,
} from './auth.utils.js';
import type { RegisterInput, LoginInput } from './auth.dto.js';

export class AuthService {
  /**
   * Register a new user account.
   */
  async register(input: RegisterInput) {
    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [input.email]);
    if (existing.rows.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Insert user
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [input.name, input.email, passwordHash]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken();

    // Store hashed refresh token
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, hashToken(refreshToken), getRefreshExpiry()]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'REGISTER', 'USER', user.id]
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login with email/password.
   */
  async login(input: LoginInput) {
    // Find user by email
    const result = await query(
      'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1',
      [input.email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = result.rows[0];

    // Verify password
    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken();

    // Store hashed refresh token
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, hashToken(refreshToken), getRefreshExpiry()]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'LOGIN', 'USER', user.id]
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh: validate old refresh token, revoke it, issue new pair (rotation).
   */
  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    // Find valid (non-revoked, non-expired) token
    const result = await query(
      `SELECT rt.id, rt.user_id, u.name, u.email, u.role
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1
         AND rt.revoked = FALSE
         AND rt.expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const record = result.rows[0];

    // Revoke old token (rotation)
    await query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [record.id]);

    // Issue new pair
    const newAccessToken = generateAccessToken({
      id: record.user_id,
      email: record.email,
      role: record.role,
    });
    const newRefreshToken = generateRefreshToken();

    // Store new hashed refresh token
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [record.user_id, hashToken(newRefreshToken), getRefreshExpiry()]
    );

    return {
      user: {
        id: record.user_id,
        name: record.name,
        email: record.email,
        role: record.role,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout: revoke all refresh tokens for the user.
   */
  async logout(userId: string) {
    await query(
      'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE',
      [userId]
    );

    await query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'LOGOUT', 'USER', userId]
    );
  }
}

export const authService = new AuthService();
