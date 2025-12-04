// ============================================
// EXAMPLE: How to add a new "Patient" module
// ============================================

// 1. Add Patient model to prisma/schema.prisma
/*
model Patient {
  id              String    @id @default(uuid())
  firstName       String    @map("first_name")
  lastName        String    @map("last_name")
  dateOfBirth     DateTime  @map("date_of_birth")
  gender          String
  email           String?   @unique
  phoneNumber     String    @map("phone_number")
  address         String
  
  // Medical information
  bloodType       String?   @map("blood_type")
  allergies       String?
  chronicDiseases String?   @map("chronic_diseases")
  
  // Relationship with User (doctor/admin who created the patient)
  createdById     String    @map("created_by_id")
  createdBy       User      @relation(fields: [createdById], references: [id])
  
  // Status
  isActive        Boolean   @default(true) @map("is_active")
  isDeleted       Boolean   @default(false) @map("is_deleted")
  
  // Timestamps
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  @@map("patients")
  @@index([email])
  @@index([createdById])
}

// Don't forget to update User model to include the relation:
model User {
  // ... existing fields
  patients        Patient[]  // Add this line
}
*/

// 2. Create src/validators/patient.validator.ts
/*
import { z } from 'zod';

export const createPatientSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email().optional(),
  phoneNumber: z.string(),
  address: z.string(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
*/

// 3. Create src/services/patient.service.ts
/*
import prisma from '../database/prisma';
import { CreatePatientInput, UpdatePatientInput } from '../validators/patient.validator';

export class PatientService {
  async createPatient(data: CreatePatientInput, createdById: string) {
    const patient = await prisma.patient.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return patient;
  }

  async getAllPatients(includeDeleted = false) {
    return prisma.patient.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPatientById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        createdBy: {
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
      throw new Error('Patient not found');
    }

    return patient;
  }

  async updatePatient(id: string, data: UpdatePatientInput) {
    return prisma.patient.update({
      where: { id },
      data,
    });
  }

  async deletePatient(id: string) {
    await prisma.patient.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Patient deleted successfully' };
  }
}

export const patientService = new PatientService();
*/

// 4. Create src/controllers/patient.controller.ts
/*
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { patientService } from '../services/patient.service';
import { createPatientSchema, updatePatientSchema } from '../validators/patient.validator';

export class PatientController {
  async createPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const validatedData = await createPatientSchema.parseAsync(req.body);
      const patient = await patientService.createPatient(validatedData, req.user.userId);

      res.status(201).json({
        message: 'Patient created successfully',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPatients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeDeleted = req.query.includeDeleted === 'true';
      const patients = await patientService.getAllPatients(includeDeleted);

      res.status(200).json({
        message: 'Patients retrieved successfully',
        data: patients,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await patientService.getPatientById(id);

      res.status(200).json({
        message: 'Patient retrieved successfully',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = await updatePatientSchema.parseAsync(req.body);
      const patient = await patientService.updatePatient(id, validatedData);

      res.status(200).json({
        message: 'Patient updated successfully',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await patientService.deletePatient(id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const patientController = new PatientController();
*/

// 5. Create src/routes/patient.routes.ts
/*
import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', patientController.createPatient.bind(patientController));
router.get('/', patientController.getAllPatients.bind(patientController));
router.get('/:id', patientController.getPatientById.bind(patientController));
router.put('/:id', patientController.updatePatient.bind(patientController));
router.delete('/:id', patientController.deletePatient.bind(patientController));

export default router;
*/

// 6. Update src/routes/index.ts
/*
import { Router } from 'express';
import userRoutes from './user.routes';
import patientRoutes from './patient.routes';  // Add this

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/users', userRoutes);
router.use('/patients', patientRoutes);  // Add this

export default router;
*/

// 7. Run migration
/*
npm run prisma:migrate
# Name: add_patient_model
*/

// 8. Test the new endpoints
/*
POST /api/patients
GET /api/patients
GET /api/patients/:id
PUT /api/patients/:id
DELETE /api/patients/:id
*/

// ============================================
// PATTERN TO FOLLOW:
// ============================================
// 1. Define Prisma model
// 2. Create validator schemas (Zod)
// 3. Create service (business logic)
// 4. Create controller (HTTP handlers)
// 5. Create routes
// 6. Register routes in main router
// 7. Run migration
// 8. Test!

export {};
