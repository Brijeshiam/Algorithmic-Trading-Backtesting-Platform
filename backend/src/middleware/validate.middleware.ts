import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory: Validates request body/query/params against a Zod schema.
 * 
 * Usage:
 *   router.post('/register', validate(registerSchema), controller.register);
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // Replace with parsed (and potentially transformed) data
      req[source] = data;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
        return;
      }
      next(err);
    }
  };
}
