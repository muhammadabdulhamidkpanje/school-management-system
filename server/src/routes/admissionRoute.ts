import express, { Router } from 'express';
import { SubmitAdmission, GetAdmissions } from '../controllers/admissionController';

const router: Router = express.Router();

router.post('/', SubmitAdmission);
router.get('/', GetAdmissions);

export default router;
