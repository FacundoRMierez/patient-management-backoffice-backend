import prisma from '../database/prisma';

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        name: roleName,
        isActive: true,
      },
    },
  });

  return !!userRole;
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      role: {
        name: { in: roleNames },
        isActive: true,
      },
    },
  });

  return userRoles.length > 0;
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  const permission = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        isActive: true,
        permissions: {
          some: {
            permission: {
              name: permissionName,
            },
          },
        },
      },
    },
  });

  return !!permission;
}

/**
 * Get all user roles
 */
export async function getUserRoles(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: true,
    },
  });

  return userRoles.map((ur: any) => ur.role);
}

/**
 * Get all user permissions
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const permissions = new Set<string>();
  
  userRoles.forEach((userRole: any) => {
    userRole.role.permissions.forEach((rolePermission: any) => {
      permissions.add(rolePermission.permission.name);
    });
  });

  return Array.from(permissions);
}

/**
 * Assign role to user
 */
export async function assignRole(userId: string, roleName: string, assignedBy?: string) {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  // Check if user already has this role
  const existing = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.userRole.create({
    data: {
      userId,
      roleId: role.id,
      assignedBy,
    },
  });
}

/**
 * Remove role from user
 */
export async function removeRole(userId: string, roleName: string) {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  return prisma.userRole.deleteMany({
    where: {
      userId,
      roleId: role.id,
    },
  });
}

/**
 * Get role by name
 */
export async function getRoleByName(name: string) {
  return prisma.role.findUnique({
    where: { name },
  });
}
