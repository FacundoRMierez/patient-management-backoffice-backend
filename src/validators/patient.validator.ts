import { z } from 'zod';

// ============================================
// PATIENT VALIDATORS
// ============================================

/**
 * Guardian (Progenitor/Tutor) Schema
 */
export const guardianSchema = z.object({
  type: z.enum(['A', 'B']).describe('Tipo de progenitor'),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  dni: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  occupation: z.string().optional(),
  isLegalGuardian: z.boolean().default(false),
});

/**
 * Health Insurance (Obra Social) Schema
 */
export const healthInsuranceSchema = z.object({
  hasInsurance: z.boolean(),
  insuranceName: z.string().optional(),
  affiliateNumber: z.string().optional(),
}).refine(
  (data) => {
    if (data.hasInsurance) {
      return !!data.insuranceName;
    }
    return true;
  },
  {
    message: 'Nombre de obra social requerido',
    path: ['insuranceName'],
  }
);

/**
 * School Info Schema
 */
export const schoolInfoSchema = z.object({
  attendsSchool: z.boolean(),
  schoolName: z.string().optional(),
  schoolAddress: z.string().optional(),
  grade: z.string().optional(),
  observations: z.string().optional(),
}).refine(
  (data) => {
    if (data.attendsSchool) {
      return !!data.schoolName && !!data.schoolAddress && !!data.grade;
    }
    return true;
  },
  {
    message: 'Información escolar completa requerida',
    path: ['schoolName'],
  }
);

/**
 * Billing Info Schema
 */
export const billingInfoSchema = z.object({
  requiresBilling: z.boolean(),
  businessName: z.string().optional(),
  taxId: z.string().optional(),
  taxCondition: z.enum(['RESPONSABLE_INSCRIPTO', 'MONOTRIBUTO', 'EXENTO', 'CONSUMIDOR_FINAL']).optional(),
  fiscalAddress: z.string().optional(),
  billingEmail: z.string().email('Email inválido').optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.requiresBilling) {
      return !!data.businessName && !!data.taxId && !!data.taxCondition && !!data.fiscalAddress;
    }
    return true;
  },
  {
    message: 'Información de facturación completa requerida',
    path: ['businessName'],
  }
);

/**
 * Create Patient Schema
 */
export const createPatientSchema = z.object({
  // Datos Personales
  dni: z.string().min(7, 'DNI debe tener al menos 7 caracteres'),
  cut: z.string().optional(),
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  dateOfBirth: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  address: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
  phoneNumber: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  
  // Obra Social
  healthInsurance: healthInsuranceSchema.optional(),
  
  // Progenitores
  guardians: z.array(guardianSchema).min(1, 'Debe agregar al menos un progenitor/tutor'),
  legalGuardianType: z.enum(['A', 'B']).optional(),
  
  // Datos Escolares
  schoolInfo: schoolInfoSchema.optional(),
  
  // Facturación
  billingInfo: billingInfoSchema.optional(),
  
  // Status (solo para profesionales/admins)
  status: z.enum(['PENDING', 'APPROVED', 'INACTIVE']).optional(),
});

/**
 * Update Patient Schema
 */
export const updatePatientSchema = createPatientSchema.partial();

/**
 * Query Patients Schema (filters)
 */
export const queryPatientsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'INACTIVE']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  hasInsurance: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'dateOfBirth']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * TypeScript Types
 */
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type QueryPatientsInput = z.infer<typeof queryPatientsSchema>;
export type GuardianInput = z.infer<typeof guardianSchema>;
export type HealthInsuranceInput = z.infer<typeof healthInsuranceSchema>;
export type SchoolInfoInput = z.infer<typeof schoolInfoSchema>;
export type BillingInfoInput = z.infer<typeof billingInfoSchema>;
