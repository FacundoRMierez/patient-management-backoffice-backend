import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../database/prisma';
import { RegisterInput, UpdateUserInput } from '../validators/user.validator';
import { assignRole, getUserRoles } from '../utils/permissions.helper';
import { getMessageBoth } from '../config/messages';

// ============================================
// USER SERVICE - Business Logic Layer
// ============================================

export class UserService {
  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hashed password
   */
  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, email: string, roles: string[]): string {
    return jwt.sign(
      { userId, email, roles }, 
      config.jwt.secret, 
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const error: any = new Error(getMessageBoth('auth.emailAlreadyExists').es);
      error.i18n = getMessageBoth('auth.emailAlreadyExists');
      throw error;
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationName: data.organizationName,
        address: data.address,
        phoneNumber: data.phoneNumber,
        professionalType: data.professionalType,
        licenseNumber: data.licenseNumber,
        specialization: data.specialization,
      },
    });

    // Assign roles to user
    const rolesToAssign = data.roles || ['PROFESSIONAL'];
    for (const roleName of rolesToAssign) {
      await assignRole(user.id, roleName);
    }

    // Get user with roles
    const roles = await getUserRoles(user.id);

    // Prepare user response
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationName: user.organizationName,
      address: user.address,
      phoneNumber: user.phoneNumber,
      professionalType: user.professionalType,
      licenseNumber: user.licenseNumber,
      specialization: user.specialization,
      isApproved: user.isApproved,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: roles.map((r: any) => r.name),
    };

    // Generate token with roles
    const token = this.generateToken(user.id, user.email, roles.map((r: any) => r.name));

    return { user: userResponse, token };
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error: any = new Error(getMessageBoth('auth.invalidCredentials').es);
      error.i18n = getMessageBoth('auth.invalidCredentials');
      throw error;
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new Error('Account has been deleted');
    }

    // Check if user is active
    if (!user.isActive) {
      const error: any = new Error(getMessageBoth('auth.accountInactive').es);
      error.i18n = getMessageBoth('auth.accountInactive');
      throw error;
    }

    // Check if user is approved
    if (!user.isApproved) {
      const error: any = new Error(getMessageBoth('auth.accountPendingApproval').es);
      error.i18n = getMessageBoth('auth.accountPendingApproval');
      throw error;
    }

    // Compare password
    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      const error: any = new Error(getMessageBoth('auth.invalidCredentials').es);
      error.i18n = getMessageBoth('auth.invalidCredentials');
      throw error;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Get user roles
    const roles = await getUserRoles(user.id);

    // Generate token with roles
    const token = this.generateToken(user.id, user.email, roles.map((r: any) => r.name));

    // Return user without password but with roles
    const { password: _, ...userWithoutPassword } = user;

    return { 
      user: {
        ...userWithoutPassword,
        roles: roles.map((r: any) => r.name)
      }, 
      token 
    };
  }

  /**
   * Get all users (with filters)
   */
  async getAllUsers(includeDeleted = false) {
    const users = await prisma.user.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        address: true,
        phoneNumber: true,
        professionalType: true,
        licenseNumber: true,
        specialization: true,
        isDeleted: true,
        isApproved: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform roles to simple roles array
    return users.map((user: any) => ({
      ...user,
      roles: user.roles.map((ur: any) => ur.role.name),
    }));
  }

  /**
   * Get users pending approval (Super Admin only)
   */
  async getPendingApprovalUsers() {
    const users = await prisma.user.findMany({
      where: {
        isApproved: false,
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        professionalType: true,
        licenseNumber: true,
        specialization: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform roles to simple roles array
    return users.map((user: any) => ({
      ...user,
      roles: user.roles.map((ur: any) => ur.role.name),
    }));
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        address: true,
        phoneNumber: true,
        professionalType: true,
        licenseNumber: true,
        specialization: true,
        isDeleted: true,
        isApproved: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      const error: any = new Error(getMessageBoth('auth.userNotFound').es);
      error.i18n = getMessageBoth('auth.userNotFound');
      throw error;
    }

    // Transform roles to simple roles array
    return {
      ...user,
      roles: user.roles.map((ur: any) => ur.role.name),
    };
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserInput) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        address: true,
        phoneNumber: true,
        professionalType: true,
        licenseNumber: true,
        specialization: true,
        isApproved: true,
        isActive: true,
        updatedAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Transform roles to simple roles array
    return {
      ...user,
      roles: user.roles.map((ur: any) => ur.role.name),
    };
  }

  /**
   * Soft delete user
   */
  async deleteUser(id: string) {
    await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Approve user
   */
  async approveUser(id: string) {
    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isApproved: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Transform roles to simple roles array
    return {
      ...user,
      roles: user.roles.map((ur: any) => ur.role.name),
    };
  }

  /**
   * Change password
   */
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      const error: any = new Error(getMessageBoth('auth.userNotFound').es);
      error.i18n = getMessageBoth('auth.userNotFound');
      throw error;
    }

    // Verify current password
    const isPasswordValid = await this.comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      const error: any = new Error(getMessageBoth('user.currentPasswordIncorrect').es);
      error.i18n = getMessageBoth('user.currentPasswordIncorrect');
      throw error;
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}

export const userService = new UserService();
