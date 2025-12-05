import prisma from '../database/prisma';
import { CreatePatientInput, UpdatePatientInput, QueryPatientsInput } from '../validators/patient.validator';
import { getMessageBoth } from '../config/messages';

// ============================================
// PATIENT SERVICE - Business Logic Layer
// ============================================

export class PatientService {
  /**
   * Create a new patient
   * Auto-approve if created by professional, pending if from public site
   */
  async createPatient(data: CreatePatientInput, professionalId: string, isFromPublicSite: boolean = false) {
    // Check if patient with this DNI already exists for this professional
    const existingPatient = await prisma.patient.findFirst({
      where: {
        dni: data.dni,
        professionalId,
        isDeleted: false,
      },
    });

    if (existingPatient) {
      const error: any = new Error(getMessageBoth('patient.alreadyExists').es);
      error.i18n = getMessageBoth('patient.alreadyExists');
      throw error;
    }

    // Determine status based on origin
    const status = isFromPublicSite ? 'PENDING' : (data.status || 'APPROVED');

    // Create patient with all related data in a transaction
    const patient = await prisma.$transaction(async (tx) => {
      // Create patient
      const newPatient = await tx.patient.create({
        data: {
          dni: data.dni,
          cut: data.cut,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          phoneNumber: data.phoneNumber,
          email: data.email,
          professionalId,
          status,
          createdBy: professionalId, // Auditoría: quién creó
          ...(status === 'APPROVED' && {
            approvedAt: new Date(),
            approvedBy: professionalId,
          }),
        },
      });

      // Create health insurance if provided
      if (data.healthInsurance?.hasInsurance && data.healthInsurance.insuranceName) {
        await tx.healthInsurance.create({
          data: {
            patientId: newPatient.id,
            insuranceName: data.healthInsurance.insuranceName,
            affiliateNumber: data.healthInsurance.affiliateNumber,
          },
        });
      }

      // Create guardians
      if (data.guardians && data.guardians.length > 0) {
        for (const guardian of data.guardians) {
          const isLegalGuardian = data.legalGuardianType === guardian.type;
          await tx.guardian.create({
            data: {
              patientId: newPatient.id,
              type: guardian.type,
              firstName: guardian.firstName,
              lastName: guardian.lastName,
              dni: guardian.dni,
              phoneNumber: guardian.phoneNumber,
              email: guardian.email || undefined,
              occupation: guardian.occupation,
              isLegalGuardian,
            },
          });
        }
      }

      // Create school info if provided
      if (data.schoolInfo?.attendsSchool && data.schoolInfo.schoolName) {
        await tx.schoolInfo.create({
          data: {
            patientId: newPatient.id,
            schoolName: data.schoolInfo.schoolName,
            schoolAddress: data.schoolInfo.schoolAddress!,
            grade: data.schoolInfo.grade!,
            observations: data.schoolInfo.observations,
          },
        });
      }

      // Create billing info if provided
      if (data.billingInfo?.requiresBilling && data.billingInfo.businessName) {
        await tx.billingInfo.create({
          data: {
            patientId: newPatient.id,
            requiresBilling: true,
            businessName: data.billingInfo.businessName,
            taxId: data.billingInfo.taxId!,
            taxCondition: data.billingInfo.taxCondition!,
            fiscalAddress: data.billingInfo.fiscalAddress!,
            billingEmail: data.billingInfo.billingEmail || undefined,
          },
        });
      }

      return newPatient;
    });

    // Return patient with all relations
    return this.getPatientById(patient.id, professionalId);
  }

  /**
   * Get all patients for a professional with pagination and filters
   */
  async getPatients(professionalId: string, query: QueryPatientsInput) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      isActive,
      hasInsurance,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      professionalId,
      isDeleted: false,
    };

    if (status) {
      where.status = status;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { dni: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (hasInsurance !== undefined) {
      if (hasInsurance === 'true') {
        where.healthInsurance = { isNot: null };
      } else {
        where.healthInsurance = null;
      }
    }

    // Get total count
    const total = await prisma.patient.count({ where });

    // Get patients
    const patients = await prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        healthInsurance: true,
        guardians: true,
        schoolInfo: true,
        billingInfo: true,
      },
    });

    // Calculate age for each patient
    const patientsWithAge = patients.map((patient) => ({
      ...patient,
      age: this.calculateAge(patient.dateOfBirth),
    }));

    return {
      data: patientsWithAge,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get single patient by ID
   */
  async getPatientById(patientId: string, professionalId: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        professionalId,
        isDeleted: false,
      },
      include: {
        healthInsurance: true,
        guardians: {
          orderBy: { type: 'asc' },
        },
        schoolInfo: true,
        billingInfo: true,
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!patient) {
      const error: any = new Error(getMessageBoth('patient.notFound').es);
      error.i18n = getMessageBoth('patient.notFound');
      throw error;
    }

    return {
      ...patient,
      age: this.calculateAge(patient.dateOfBirth),
    };
  }

  /**
   * Update patient
   */
  async updatePatient(patientId: string, data: UpdatePatientInput, professionalId: string) {
    // Check if patient exists and belongs to professional
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        professionalId,
        isDeleted: false,
      },
    });

    if (!existingPatient) {
      const error: any = new Error(getMessageBoth('patient.notFound').es);
      error.i18n = getMessageBoth('patient.notFound');
      throw error;
    }

    // Update patient and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Update patient basic data
      await tx.patient.update({
        where: { id: patientId },
        data: {
          dni: data.dni,
          cut: data.cut,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          phoneNumber: data.phoneNumber,
          email: data.email,
          status: data.status,
          lastModifiedBy: professionalId, // Auditoría: quién modificó
        },
      });

      // Update health insurance
      if (data.healthInsurance !== undefined) {
        if (data.healthInsurance.hasInsurance && data.healthInsurance.insuranceName) {
          await tx.healthInsurance.upsert({
            where: { patientId },
            create: {
              patientId,
              insuranceName: data.healthInsurance.insuranceName,
              affiliateNumber: data.healthInsurance.affiliateNumber,
            },
            update: {
              insuranceName: data.healthInsurance.insuranceName,
              affiliateNumber: data.healthInsurance.affiliateNumber,
            },
          });
        } else {
          // Delete if exists
          await tx.healthInsurance.deleteMany({ where: { patientId } });
        }
      }

      // Update guardians
      if (data.guardians) {
        // Delete existing guardians
        await tx.guardian.deleteMany({ where: { patientId } });
        
        // Create new guardians
        for (const guardian of data.guardians) {
          const isLegalGuardian = data.legalGuardianType === guardian.type;
          await tx.guardian.create({
            data: {
              patientId,
              type: guardian.type,
              firstName: guardian.firstName,
              lastName: guardian.lastName,
              dni: guardian.dni,
              phoneNumber: guardian.phoneNumber,
              email: guardian.email || undefined,
              occupation: guardian.occupation,
              isLegalGuardian,
            },
          });
        }
      }

      // Update school info
      if (data.schoolInfo !== undefined) {
        if (data.schoolInfo.attendsSchool && data.schoolInfo.schoolName) {
          await tx.schoolInfo.upsert({
            where: { patientId },
            create: {
              patientId,
              schoolName: data.schoolInfo.schoolName,
              schoolAddress: data.schoolInfo.schoolAddress!,
              grade: data.schoolInfo.grade!,
              observations: data.schoolInfo.observations,
            },
            update: {
              schoolName: data.schoolInfo.schoolName,
              schoolAddress: data.schoolInfo.schoolAddress!,
              grade: data.schoolInfo.grade!,
              observations: data.schoolInfo.observations,
            },
          });
        } else {
          await tx.schoolInfo.deleteMany({ where: { patientId } });
        }
      }

      // Update billing info
      if (data.billingInfo !== undefined) {
        if (data.billingInfo.requiresBilling && data.billingInfo.businessName) {
          await tx.billingInfo.upsert({
            where: { patientId },
            create: {
              patientId,
              requiresBilling: true,
              businessName: data.billingInfo.businessName,
              taxId: data.billingInfo.taxId!,
              taxCondition: data.billingInfo.taxCondition!,
              fiscalAddress: data.billingInfo.fiscalAddress!,
              billingEmail: data.billingInfo.billingEmail || undefined,
            },
            update: {
              requiresBilling: true,
              businessName: data.billingInfo.businessName,
              taxId: data.billingInfo.taxId!,
              taxCondition: data.billingInfo.taxCondition!,
              fiscalAddress: data.billingInfo.fiscalAddress!,
              billingEmail: data.billingInfo.billingEmail || undefined,
            },
          });
        } else {
          await tx.billingInfo.updateMany({
            where: { patientId },
            data: { requiresBilling: false },
          });
        }
      }
    });

    // Return updated patient
    return this.getPatientById(patientId, professionalId);
  }

  /**
   * Soft delete patient
   */
  async deletePatient(patientId: string, professionalId: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        professionalId,
        isDeleted: false,
      },
    });

    if (!patient) {
      const error: any = new Error(getMessageBoth('patient.notFound').es);
      error.i18n = getMessageBoth('patient.notFound');
      throw error;
    }

    await prisma.patient.update({
      where: { id: patientId },
      data: { 
        isDeleted: true,
        deletedAt: new Date(), // Auditoría: cuándo se eliminó
      },
    });
  }

  /**
   * Toggle patient active status
   */
  async toggleActiveStatus(patientId: string, professionalId: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        professionalId,
        isDeleted: false,
      },
    });

    if (!patient) {
      const error: any = new Error(getMessageBoth('patient.notFound').es);
      error.i18n = getMessageBoth('patient.notFound');
      throw error;
    }

    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: { 
        isActive: !patient.isActive,
        ...(patient.isActive && { deactivatedAt: new Date() }), // Si se desactiva, registrar cuándo
        ...(!patient.isActive && { deactivatedAt: null }), // Si se reactiva, limpiar fecha
      },
    });

    return updated.isActive;
  }

  /**
   * Approve pending patient
   */
  async approvePatient(patientId: string, professionalId: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        professionalId,
        isDeleted: false,
      },
    });

    if (!patient) {
      const error: any = new Error(getMessageBoth('patient.notFound').es);
      error.i18n = getMessageBoth('patient.notFound');
      throw error;
    }

    if (patient.status === 'APPROVED') {
      const error: any = new Error(getMessageBoth('patient.alreadyApproved').es);
      error.i18n = getMessageBoth('patient.alreadyApproved');
      throw error;
    }

    await prisma.patient.update({
      where: { id: patientId },
      data: { 
        status: 'APPROVED',
        approvedAt: new Date(),    // Auditoría: cuándo se aprobó
        approvedBy: professionalId, // Auditoría: quién aprobó
      },
    });

    return this.getPatientById(patientId, professionalId);
  }

  /**
   * Get dashboard stats for patients
   */
  async getPatientStats(professionalId: string) {
    const [
      totalPatients,
      activePatients,
      pendingPatients,
      patientsWithInsurance,
      patientsThisMonth,
    ] = await Promise.all([
      prisma.patient.count({
        where: { professionalId, isDeleted: false },
      }),
      prisma.patient.count({
        where: { professionalId, isDeleted: false, isActive: true, status: 'APPROVED' },
      }),
      prisma.patient.count({
        where: { professionalId, isDeleted: false, status: 'PENDING' },
      }),
      prisma.patient.count({
        where: {
          professionalId,
          isDeleted: false,
          healthInsurance: { isNot: null },
        },
      }),
      prisma.patient.count({
        where: {
          professionalId,
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      totalPatients,
      activePatients,
      pendingPatients,
      patientsWithInsurance,
      insurancePercentage: totalPatients > 0 ? Math.round((patientsWithInsurance / totalPatients) * 100) : 0,
      patientsThisMonth,
    };
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }
}

export const patientService = new PatientService();
