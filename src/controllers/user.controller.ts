import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { userService } from '../services/user.service';
import {
  registerUserSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
} from '../validators/user.validator';

// ============================================
// USER CONTROLLER - Request Handlers
// ============================================

export class UserController {
  /**
   * Register a new user
   * POST /api/users/register
   */
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = await registerUserSchema.parseAsync(req.body);
      const result = await userService.register(validatedData);

      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/users/login
   */
  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = await loginSchema.parseAsync(req.body);
      const result = await userService.login(validatedData.email, validatedData.password);

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users
   * GET /api/users
   */
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeDeleted = req.query.includeDeleted === 'true';
      const users = await userService.getAllUsers(includeDeleted);

      res.status(200).json({
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users pending approval
   * GET /api/users/pending-approval
   */
  async getPendingApprovalUsers(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getPendingApprovalUsers();

      res.status(200).json({
        message: 'Pending approval users retrieved successfully',
        data: users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.status(200).json({
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/users/me
   */
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await userService.getUserById(req.user.userId);

      res.status(200).json({
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = await updateUserSchema.parseAsync(req.body);
      const user = await userService.updateUser(id, validatedData);

      res.status(200).json({
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (soft delete)
   * DELETE /api/users/:id
   */
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve user
   * PATCH /api/users/:id/approve
   */
  async approveUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.approveUser(id);

      res.status(200).json({
        message: 'User approved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * POST /api/users/change-password
   */
  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const validatedData = await changePasswordSchema.parseAsync(req.body);
      const result = await userService.changePassword(
        req.user.userId,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
