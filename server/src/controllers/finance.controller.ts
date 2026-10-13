import type { Request, Response } from 'express';
import * as FinanceService from '../services/finance.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

export const listFees = asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await FinanceService.listFees(Number(req.query.page ?? 1), Number(req.query.limit ?? 20)), 'Fees fetched'));
export const createFee = asyncHandler(async (req: Request, res: Response) => sendCreated(res, await FinanceService.createFee(req.body, req.user!.sub, req.ip), 'Fee created'));
export const updateFee = asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await FinanceService.updateFee(req.params.id as string, req.body, req.user!.sub, req.ip), 'Fee updated'));
export const deleteFee = asyncHandler(async (req: Request, res: Response) => { await FinanceService.deleteFee(req.params.id as string, req.user!.sub, req.ip); sendSuccess(res, null, 'Fee deleted'); });

export const listInvoices = asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await FinanceService.listInvoices(Number(req.query.page ?? 1), Number(req.query.limit ?? 20), typeof req.query.studentId === 'string' ? req.query.studentId : undefined, typeof req.query.status === 'string' ? req.query.status : undefined), 'Invoices fetched'));
export const createInvoice = asyncHandler(async (req: Request, res: Response) => sendCreated(res, await FinanceService.createInvoice(req.body, req.user!.sub, req.ip), 'Invoice created'));
export const recordPayment = asyncHandler(async (req: Request, res: Response) => sendCreated(res, await FinanceService.recordPayment(req.body, req.user!.sub, req.ip), 'Payment recorded'));
export const initializePaystackPayment = asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await FinanceService.initializePaystackPayment(req.body.invoiceId, req.body.email), 'Paystack payment initialized'));
export const verifyPaystackPayment = asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await FinanceService.verifyPaystackPayment(req.params.reference as string, req.user!.sub, req.ip), 'Paystack payment verified'));
