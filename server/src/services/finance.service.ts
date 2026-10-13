import { Prisma } from '../generated/prisma/index.js';
import * as FinanceRepo from '../repositories/finance.repositories.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';
import { env } from '../config/env.js';

type DecimalValue = Prisma.Decimal | number;
const amount = (value: DecimalValue) => Number(value);
const serializeFee = <T extends { amount: DecimalValue }>(fee: T) => ({ ...fee, amount: amount(fee.amount) });
const serializeInvoice = <T extends { amount: DecimalValue; fee: { amount: DecimalValue }; payments: Array<{ amount: DecimalValue }> }>(invoice: T) => ({
  ...invoice,
  amount: amount(invoice.amount),
  fee: serializeFee(invoice.fee),
  payments: invoice.payments.map((payment) => ({ ...payment, amount: amount(payment.amount) })),
});

export const listFees = async (page: number, limit: number) => {
  const [fees, total] = await FinanceRepo.listFees((page - 1) * limit, limit);
  return { fees: fees.map(serializeFee), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const createFee = async (dto: { name: string; code: string; amount: number; currency: string; description?: string | null }, actorId: string, ipAddress?: string) => {
  if (await FinanceRepo.findFeeByCode(dto.code)) throw new ConflictError('Fee code already exists');
  const fee = await FinanceRepo.createFee({ ...dto, amount: new Prisma.Decimal(dto.amount) });
  await FinanceRepo.createAuditLog({ action: 'FEE_CREATED', userId: actorId, recordId: fee.id, ...(ipAddress !== undefined && { ipAddress }) });
  return serializeFee(fee);
};

export const updateFee = async (id: string, dto: { name?: string; amount?: number; description?: string | null; isActive?: boolean }, actorId: string, ipAddress?: string) => {
  if (!(await FinanceRepo.findFeeById(id))) throw new NotFoundError('Fee');
  const fee = await FinanceRepo.updateFee(id, { ...dto, ...(dto.amount !== undefined && { amount: new Prisma.Decimal(dto.amount) }) });
  await FinanceRepo.createAuditLog({ action: 'FEE_UPDATED', userId: actorId, recordId: id, ...(ipAddress !== undefined && { ipAddress }) });
  return serializeFee(fee);
};

export const deleteFee = async (id: string, actorId: string, ipAddress?: string) => {
  if (!(await FinanceRepo.findFeeById(id))) throw new NotFoundError('Fee');
  await FinanceRepo.deleteFee(id);
  await FinanceRepo.createAuditLog({ action: 'FEE_DELETED', userId: actorId, recordId: id, ...(ipAddress !== undefined && { ipAddress }) });
};

export const listInvoices = async (page: number, limit: number, studentId?: string, status?: string) => {
  const [invoices, total] = await FinanceRepo.listInvoices((page - 1) * limit, limit, { ...(studentId !== undefined && { studentId }), ...(status !== undefined && { status: status as never }) });
  return { invoices: invoices.map(serializeInvoice), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const createInvoice = async (dto: { studentId: string; feeId: string; dueDate?: Date | null }, actorId: string, ipAddress?: string) => {
  if (!(await FinanceRepo.findStudent(dto.studentId))) throw new NotFoundError('Student');
  const fee = await FinanceRepo.findFeeById(dto.feeId);
  if (!fee) throw new NotFoundError('Fee');
  if (!fee.isActive) throw new BadRequestError('Cannot invoice an inactive fee');
  if (await FinanceRepo.findInvoiceByStudentAndFee(dto.studentId, dto.feeId)) throw new ConflictError('Invoice already exists');
  const invoice = await FinanceRepo.createInvoice({ student: { connect: { id: dto.studentId } }, fee: { connect: { id: dto.feeId } }, amount: fee.amount, ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }) });
  await FinanceRepo.createAuditLog({ action: 'INVOICE_CREATED', userId: actorId, recordId: invoice.id, ...(ipAddress !== undefined && { ipAddress }) });
  return serializeInvoice(invoice);
};

export const recordPayment = async (dto: { invoiceId: string; amount: number; method: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY'; reference?: string | null }, actorId: string, ipAddress?: string) => {
  const invoice = await FinanceRepo.findInvoice(dto.invoiceId);
  if (!invoice) throw new NotFoundError('Invoice');
  const alreadyPaid = invoice.payments.reduce((sum: number, payment: { amount: DecimalValue }) => sum + amount(payment.amount), 0);
  if (alreadyPaid + dto.amount > amount(invoice.amount)) throw new BadRequestError('Payment exceeds invoice balance');
  const updated = await FinanceRepo.recordPayment(dto.invoiceId, { amount: new Prisma.Decimal(dto.amount), method: dto.method, ...(dto.reference !== undefined && { reference: dto.reference }) });
  if (!updated) throw new NotFoundError('Invoice');
  await FinanceRepo.createAuditLog({ action: 'PAYMENT_RECORDED', userId: actorId, recordId: dto.invoiceId, ...(ipAddress !== undefined && { ipAddress }) });
  return serializeInvoice(updated);
};

const paystackRequest = async <T>(path: string, options: RequestInit): Promise<T> => {
  if (!env.PAYSTACK_SECRET_KEY) throw new BadRequestError('Paystack is not configured');
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json() as { status: boolean; message?: string; data?: T };
  if (!response.ok || !payload.status || payload.data === undefined) {
    throw new BadRequestError(payload.message ?? 'Paystack request failed');
  }
  return payload.data;
};

interface PaystackInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerifyResponse {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  metadata?: { invoiceId?: string };
}

export const initializePaystackPayment = async (invoiceId: string, email: string) => {
  const invoice = await FinanceRepo.findInvoice(invoiceId);
  if (!invoice) throw new NotFoundError('Invoice');
  const paid = invoice.payments.reduce((sum: number, payment: { amount: DecimalValue }) => sum + amount(payment.amount), 0);
  const balance = amount(invoice.amount) - paid;
  if (balance <= 0) throw new BadRequestError('Invoice is already paid');
  const result = await paystackRequest<PaystackInitializeResponse>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email,
      amount: Math.round(balance * 100),
      currency: invoice.fee.currency,
      ...(env.PAYSTACK_CALLBACK_URL !== undefined && { callback_url: env.PAYSTACK_CALLBACK_URL }),
      metadata: { invoiceId },
    }),
  });
  return result;
};

export const verifyPaystackPayment = async (reference: string, actorId: string, ipAddress?: string) => {
  const existingPayment = await FinanceRepo.findPaymentByReference(reference);
  if (existingPayment) {
    const invoice = await FinanceRepo.findInvoice(existingPayment.invoiceId);
    if (!invoice) throw new NotFoundError('Invoice');
    return serializeInvoice(invoice);
  }

  const transaction = await paystackRequest<PaystackVerifyResponse>(`/transaction/verify/${encodeURIComponent(reference)}`, { method: 'GET' });
  if (transaction.status !== 'success' || !transaction.metadata?.invoiceId || transaction.reference !== reference) {
    throw new BadRequestError('Paystack payment was not successful');
  }
  const invoice = await FinanceRepo.findInvoice(transaction.metadata.invoiceId);
  if (!invoice) throw new NotFoundError('Invoice');
  if (transaction.currency !== invoice.fee.currency || transaction.amount <= 0) throw new BadRequestError('Paystack payment does not match the invoice currency');

  const paid = invoice.payments.reduce((sum: number, payment: { amount: DecimalValue }) => sum + amount(payment.amount), 0);
  const paymentAmount = transaction.amount / 100;
  if (paid + paymentAmount > amount(invoice.amount)) throw new BadRequestError('Paystack payment exceeds invoice balance');
  return recordPayment({ invoiceId: invoice.id, amount: paymentAmount, method: 'CARD', reference }, actorId, ipAddress);
};
