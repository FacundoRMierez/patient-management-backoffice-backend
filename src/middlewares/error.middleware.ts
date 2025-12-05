import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { isDevelopment } from '../config';
import { getMessageBoth } from '../config/messages';

/**
 * Global error handler middleware with i18n support
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        es: 'Error de validación',
        en: 'Validation error',
      },
      details: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
      ...(isDevelopment && { stack: error.stack }),
    });
    return;
  }

  // Handle errors with i18n property (from our services)
  if (error.i18n) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({
      success: false,
      error: error.i18n,
      ...(isDevelopment && { stack: error.stack }),
    });
    return;
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: {
        es: 'Ya existe un registro con estos datos.',
        en: 'A record with this data already exists.',
      },
      ...(isDevelopment && { stack: error.stack }),
    });
    return;
  }

  if (error.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: getMessageBoth('general.notFound'),
      ...(isDevelopment && { stack: error.stack }),
    });
    return;
  }

  // Handle generic errors (fallback)
  const statusCode = error.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: {
      es: error.message || 'Error interno del servidor',
      en: error.message || 'Internal server error',
    },
    ...(isDevelopment && { stack: error.stack }),
  });
};

