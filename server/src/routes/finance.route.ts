import { Router } from 'express';
import * as FinanceController from '../controllers/finance.controller.js';
import { authenticate, authorizePermission, authorizeRole } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import { createFeeSchema, createInvoiceSchema, createPaymentSchema, createPaystackPaymentSchema, feeIdSchema, invoiceIdSchema, updateFeeSchema, verifyPaystackPaymentSchema } from '../validators/finance.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.financeRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.financeWrite)];

router.get('/fees', ...canRead, FinanceController.listFees);
router.post('/fees', ...canWrite, validate(createFeeSchema), FinanceController.createFee);
router.patch('/fees/:id', ...canWrite, validate(updateFeeSchema), FinanceController.updateFee);
router.delete('/fees/:id', ...canWrite, validate(feeIdSchema), FinanceController.deleteFee);
router.get('/invoices', ...canRead, FinanceController.listInvoices);
router.post('/invoices', ...canWrite, validate(createInvoiceSchema), FinanceController.createInvoice);
router.post('/payments', ...canWrite, validate(createPaymentSchema), FinanceController.recordPayment);
router.post('/payments/paystack/initialize', ...canWrite, validate(createPaystackPaymentSchema), FinanceController.initializePaystackPayment);
router.get('/payments/paystack/verify/:reference', ...canWrite, validate(verifyPaystackPaymentSchema), FinanceController.verifyPaystackPayment);

export default router;
