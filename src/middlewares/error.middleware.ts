import { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '../config';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: error.message || 'Internal server error',
    ...(isDevelopment && { stack: error.stack }),
  });
};
