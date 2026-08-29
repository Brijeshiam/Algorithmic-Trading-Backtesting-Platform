import { query } from '../../config/database.js';
import { AppError } from '../../middleware/error-handler.middleware.js';

export class UsersService {
  /**
   * Get user profile by ID.
   */
  async getProfile(userId: string) {
    const result = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.email) {
      // Check if email is taken by another user
      const existing = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [data.email, userId]
      );
      if (existing.rows.length > 0) {
        throw new AppError('Email already in use', 409);
      }
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }

    if (fields.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, name, email, role, created_at, updated_at`,
      values
    );

    const user = result.rows[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  /**
   * Admin: List all users with pagination.
   */
  async listUsers(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const [usersResult, countResult] = await Promise.all([
      query(
        `SELECT id, name, email, role, created_at
         FROM users ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      query('SELECT COUNT(*) FROM users'),
    ]);

    return {
      users: usersResult.rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.created_at,
      })),
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    };
  }
}

export const usersService = new UsersService();
