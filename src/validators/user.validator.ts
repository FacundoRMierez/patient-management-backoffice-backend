import { z } from 'zod';

// ============================================
// ENUMS
// ============================================
export const ProfessionalTypeEnum = z.enum([
  'PSYCHOLOGIST',
  'DOCTOR',
  'PSYCHIATRIST',
  'PSYCHOPEDAGOGUE',
  'DENTIST',
  'NUTRITIONIST',
  'SPEECH_THERAPIST',
  'OCCUPATIONAL_THERAPIST',
  'OTHER',
]);

// ============================================
// USER VALIDATION SCHEMAS
// ============================================

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  organizationName: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  roles: z.array(z.string()).optional().default(['PROFESSIONAL']),
  professionalType: ProfessionalTypeEnum.optional(),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  organizationName: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  professionalType: ProfessionalTypeEnum.optional(),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
