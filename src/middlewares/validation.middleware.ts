import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Validation middleware - Validate request body with Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors || error.message,
      });
    }
  };
};
