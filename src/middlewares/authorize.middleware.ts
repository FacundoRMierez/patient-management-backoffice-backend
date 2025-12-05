import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import prisma from '../database/prisma';
import { hasAnyRole } from '../utils/permissions.helper';
import { getMessageBoth } from '../config/messages';

/**
 * Authorization middleware - Check if user has any of the required role(s)
 */
export const authorize = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: getMessageBoth('auth.unauthorized') });
        return;
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { 
          id: true,
          isActive: true, 
          isDeleted: true,
        },
      });

      if (!user) {
        res.status(401).json({ error: getMessageBoth('auth.userNotFound') });
        return;
      }

      if (user.isDeleted || !user.isActive) {
        res.status(403).json({ error: getMessageBoth('auth.accountInactive') });
        return;
      }

      // Check if user has any of the required roles
      const hasRequiredRole = await hasAnyRole(user.id, allowedRoles);
      
      if (!hasRequiredRole) {
        res.status(403).json({ 
          error: getMessageBoth('auth.forbidden'),
          required: allowedRoles,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization error' });
    }
  };
};

/**
 * Middleware to check if user is Super Admin
 */
export const isSuperAdmin = authorize(['SUPER_ADMIN']);

/**
 * Middleware to check if user is Professional or Super Admin
 */
export const isProfessionalOrAdmin = authorize(['PROFESSIONAL', 'SUPER_ADMIN']);
