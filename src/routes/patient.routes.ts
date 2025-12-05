import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();

// ============================================
// PATIENT ROUTES
// ============================================

/**
 * @route   GET /api/patients/stats
 * @desc    Get patient statistics for dashboard
 * @access  Private (Professional, Super Admin)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['PROFESSIONAL', 'SUPER_ADMIN']),
  patientController.getStats.bind(patientController)
);

/**
 * @route   GET /api/patients
 * @desc    Get all patients with pagination and filters
 * @access  Private (Professional, Super Admin)
 */
router.get(
  '/',
  authenticate,
  authorize(['PROFESSIONAL', 'SUPER_ADMIN']),
  patientController.getPatients.bind(patientController)
);

/**
 * @route   POST /api/patients
 * @desc    Create a new patient
 * @access  Private (Professional, Super Admin)
 */
router.post(
  '/',
  authenticate,
  authorize(['PROFESSIONAL', 'SUPER_ADMIN']),
  patientController.createPatient.bind(patientController)
);

/**
 * @route   GET /api/patients/:id
 * @desc    Get patient by ID
 * @access  Private (Professional, Super Admin)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['PROFESSIONAL', 'SUPER_ADMIN']),
  patientController.getPatientById.bind(patientController)
);

/**
 * @route   PUT /api/patients/:id
 * @desc    Update patient
 * @access  Private (Professional, Super Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['PROFESSIONAL', 'SUPER_ADMIN']),
  patientController.updatePatient.bind(patientController)
);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Delete patient (soft delete)
 * @access  Private (Professional, Super Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['PROFESSIONAL', 'SUPER_ADMIN']),
  patientController.deletePatient.bind(patientController)
);

/**
 * @route   PATCH /api/patients/:id/toggle-status
 * @desc    Toggle patient active/inactive status
 * @access  Private (Professional, Super Admin)
 */
router.patch(
  '/:id/toggle-status',
  authenticate,
  authorize(['PROFESSIONAL', 'SUPER_ADMIN']),
  patientController.toggleStatus.bind(patientController)
);

/**
 * @route   PATCH /api/patients/:id/approve
 * @desc    Approve pending patient
 * @access  Private (Professional, Super Admin)
 */
router.patch(
  '/:id/approve',
  authenticate,
  authorize(['PROFESSIONAL', 'SUPER_ADMIN']),
  patientController.approvePatient.bind(patientController)
);

export default router;
