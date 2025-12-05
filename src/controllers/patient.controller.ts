import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { patientService } from '../services/patient.service';
import {
  createPatientSchema,
  updatePatientSchema,
  queryPatientsSchema,
} from '../validators/patient.validator';
import { createSuccessResponse } from '../config/messages';

// ============================================
// PATIENT CONTROLLER - Request Handlers
// ============================================

export class PatientController {
  /**
   * Create a new patient
   * POST /api/patients
   */
  async createPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createSuccessResponse('auth.unauthorized'));
        return;
      }

      const validatedData = await createPatientSchema.parseAsync(req.body);
      const isFromPublicSite = req.body.isFromPublicSite || false;
      
      const patient = await patientService.createPatient(
        validatedData,
        req.user.userId,
        isFromPublicSite
      );

      res.status(201).json(createSuccessResponse('patient.created', patient));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all patients (with pagination and filters)
   * GET /api/patients
   */
  async getPatients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createSuccessResponse('auth.unauthorized'));
        return;
      }

      const validatedQuery = await queryPatientsSchema.parseAsync(req.query);
      const result = await patientService.getPatients(req.user.userId, validatedQuery);

      res.status(200).json({
        success: true,
        message: createSuccessResponse('patient.allRetrieved').message,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient by ID
   * GET /api/patients/:id
   */
  async getPatientById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createSuccessResponse('auth.unauthorized'));
        return;
      }

      const { id } = req.params;
      const patient = await patientService.getPatientById(id, req.user.userId);

      res.status(200).json(createSuccessResponse('patient.retrieved', patient));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update patient
   * PUT /api/patients/:id
   */
  async updatePatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createSuccessResponse('auth.unauthorized'));
        return;
      }

      const { id } = req.params;
      const validatedData = await updatePatientSchema.parseAsync(req.body);
      const patient = await patientService.updatePatient(id, validatedData, req.user.userId);

      res.status(200).json(createSuccessResponse('patient.updated', patient));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete patient (soft delete)
   * DELETE /api/patients/:id
   */
  async deletePatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createSuccessResponse('auth.unauthorized'));
        return;
      }

      const { id } = req.params;
      await patientService.deletePatient(id, req.user.userId);

      res.status(200).json(createSuccessResponse('patient.deleted'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle patient active status
   * PATCH /api/patients/:id/toggle-status
   */
  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createSuccessResponse('auth.unauthorized'));
        return;
      }

      const { id } = req.params;
      const isActive = await patientService.toggleActiveStatus(id, req.user.userId);

      res.status(200).json(
        createSuccessResponse('patient.statusToggled', { isActive })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve pending patient
   * PATCH /api/patients/:id/approve
   */
  async approvePatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createSuccessResponse('auth.unauthorized'));
        return;
      }

      const { id } = req.params;
      const patient = await patientService.approvePatient(id, req.user.userId);

      res.status(200).json(createSuccessResponse('patient.approved', patient));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient statistics
   * GET /api/patients/stats
   */
  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createSuccessResponse('auth.unauthorized'));
        return;
      }

      const stats = await patientService.getPatientStats(req.user.userId);

      res.status(200).json(createSuccessResponse('patient.statsRetrieved', stats));
    } catch (error) {
      next(error);
    }
  }
}

export const patientController = new PatientController();
