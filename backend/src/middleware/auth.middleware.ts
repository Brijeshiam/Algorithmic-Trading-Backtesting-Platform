import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { query } from '../config/database.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Middleware: Verifies JWT access token from Authorization header.
 * Attaches user info to req.user.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload & AuthUser;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired. Please refresh.' });
      return;
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * Middleware: Requires specific role(s). Must be used after authenticate().
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions.' });
      return;
    }
    
    next();
  };
}
