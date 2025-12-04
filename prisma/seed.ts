import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create connection pool
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // CREATE ROLES
  // ============================================
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super administrator with full access to the platform',
    },
  });

  const professionalRole = await prisma.role.upsert({
    where: { name: 'PROFESSIONAL' },
    update: {},
    create: {
      name: 'PROFESSIONAL',
      description: 'Healthcare professional (psychologist, doctor, etc.)',
    },
  });

  const patientRole = await prisma.role.upsert({
    where: { name: 'PATIENT' },
    update: {},
    create: {
      name: 'PATIENT',
      description: 'Patient in the system',
    },
  });

  console.log('✅ Roles created');

  // ============================================
  // CREATE PERMISSIONS
  // ============================================
  const permissions = [
    // User permissions
    { name: 'users:create', resource: 'users', action: 'create', description: 'Create new users' },
    { name: 'users:read', resource: 'users', action: 'read', description: 'View users' },
    { name: 'users:update', resource: 'users', action: 'update', description: 'Update users' },
    { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
    { name: 'users:approve', resource: 'users', action: 'approve', description: 'Approve pending users' },
    { name: 'users:list-all', resource: 'users', action: 'list-all', description: 'List all users' },
    
    // Patient permissions (future)
    { name: 'patients:create', resource: 'patients', action: 'create', description: 'Create new patients' },
    { name: 'patients:read', resource: 'patients', action: 'read', description: 'View patients' },
    { name: 'patients:update', resource: 'patients', action: 'update', description: 'Update patients' },
    { name: 'patients:delete', resource: 'patients', action: 'delete', description: 'Delete patients' },
    { name: 'patients:approve', resource: 'patients', action: 'approve', description: 'Approve pending patients' },
    
    // Appointment permissions (future)
    { name: 'appointments:create', resource: 'appointments', action: 'create', description: 'Create appointments' },
    { name: 'appointments:read', resource: 'appointments', action: 'read', description: 'View appointments' },
    { name: 'appointments:update', resource: 'appointments', action: 'update', description: 'Update appointments' },
    { name: 'appointments:delete', resource: 'appointments', action: 'delete', description: 'Cancel appointments' },
    
    // Medical records permissions (future)
    { name: 'medical-records:create', resource: 'medical-records', action: 'create', description: 'Create medical records' },
    { name: 'medical-records:read', resource: 'medical-records', action: 'read', description: 'View medical records' },
    { name: 'medical-records:update', resource: 'medical-records', action: 'update', description: 'Update medical records' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  console.log('✅ Permissions created');

  // ============================================
  // ASSIGN PERMISSIONS TO ROLES
  // ============================================

  // SUPER_ADMIN gets ALL permissions
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Super Admin permissions assigned');

  // PROFESSIONAL gets specific permissions
  const professionalPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'users:read',
          'patients:create',
          'patients:read',
          'patients:update',
          'patients:approve',
          'appointments:create',
          'appointments:read',
          'appointments:update',
          'appointments:delete',
          'medical-records:create',
          'medical-records:read',
          'medical-records:update',
        ],
      },
    },
  });

  for (const permission of professionalPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: professionalRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: professionalRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Professional permissions assigned');

  // PATIENT gets limited permissions
  const patientPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'appointments:read',
          'medical-records:read',
        ],
      },
    },
  });

  for (const permission of patientPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: patientRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: patientRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Patient permissions assigned');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Created roles:');
  console.log('  - SUPER_ADMIN (full access)');
  console.log('  - PROFESSIONAL (manage patients, appointments, records)');
  console.log('  - PATIENT (view appointments and records)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
