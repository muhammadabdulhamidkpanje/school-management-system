import type { RequestHandler } from 'express';
import { Router } from 'express';
import * as AdmissionController from '../controllers/admission.controller.js';
import { authenticate, authorizePermission, authorizeRole } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  admissionIdSchema,
  admissionClassOptionsSchema,
  admissionListSchema,
  approveAdmissionSchema,
  informationRequestIdSchema,
  informationRequestSchema,
  informationResponseSchema,
  rejectAdmissionSchema,
  resolveInformationRequestSchema,
  validateAdmissionSubmission,
} from '../validators/admission.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.studentsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.studentsWrite)];

const applicantOrAdminRead: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization) {
    next();
    return;
  }
  authenticate(req, res, error => {
    if (error) {
      next(error);
      return;
    }
    authorizeRole('admin')(req, res, error => {
      if (error) {
        next(error);
        return;
      }
      authorizePermission(permissions.studentsRead)(req, res, next);
    });
  });
};

router.get('/options/sessions', AdmissionController.publicSessions);
router.get('/options/classes', validate(admissionClassOptionsSchema), AdmissionController.publicClassrooms);
router.post('/', validateAdmissionSubmission, AdmissionController.submit);

router.get('/', ...canRead, validate(admissionListSchema), AdmissionController.list);
router.get('/:id/class-options', ...canRead, validate(admissionIdSchema), AdmissionController.classroomsForAdmission);
router.get('/:id', applicantOrAdminRead, validate(admissionIdSchema), AdmissionController.get);
router.get('/:id/status', validate(admissionIdSchema), AdmissionController.status);
router.get('/:id/information-requests', validate(admissionIdSchema), AdmissionController.informationRequests);
router.post(
  '/:id/information-requests/:requestId/respond',
  validate(informationRequestIdSchema),
  validate(informationResponseSchema),
  AdmissionController.respondToInformationRequest,
);

router.post('/:id/review', ...canWrite, validate(admissionIdSchema), AdmissionController.review);
router.post(
  '/:id/request-information',
  ...canWrite,
  validate(admissionIdSchema),
  validate(informationRequestSchema),
  AdmissionController.requestInformation,
);
router.post(
  '/:id/information-requests/:requestId/resolve',
  ...canWrite,
  validate(informationRequestIdSchema),
  validate(resolveInformationRequestSchema),
  AdmissionController.resolveInformationRequest,
);
router.post(
  '/:id/approve',
  ...canWrite,
  validate(admissionIdSchema),
  validate(approveAdmissionSchema),
  AdmissionController.approve,
);
router.post(
  '/:id/reject',
  ...canWrite,
  validate(admissionIdSchema),
  validate(rejectAdmissionSchema),
  AdmissionController.reject,
);
router.post('/:id/enroll', ...canWrite, validate(admissionIdSchema), AdmissionController.enroll);

export default router;
