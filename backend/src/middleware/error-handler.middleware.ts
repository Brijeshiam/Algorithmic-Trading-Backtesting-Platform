import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

/**
 * Application-level error class with status code.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Async handler wrapper — catches promise rejections and forwards to error handler.
 * Prevents unhandled promise rejections from crashing the server.
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handling middleware (must be last middleware).
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Default values
  let statusCode = 500;
  let message = 'Internal server error';
  
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Log the error
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  }

  res.status(statusCode).json({
    error: message,
    ...(config.nodeEnv === 'development' && statusCode >= 500 && {
      stack: err.stack,
    }),
  });
}
