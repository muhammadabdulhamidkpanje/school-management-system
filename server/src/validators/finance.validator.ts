import { z } from 'zod';

const id = z.string().cuid();
const amount = z.coerce.number().finite().positive().max(999999999.99);

export const feeIdSchema = z.object({ params: z.object({ id }) });
export const invoiceIdSchema = z.object({ params: z.object({ id }) });

export const createFeeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(150),
    code: z.string().trim().min(2).max(30).regex(/^[A-Z0-9_-]+$/),
    amount,
    currency: z.string().trim().length(3).toUpperCase().default('NGN'),
    description: z.string().trim().max(500).optional().nullable(),
  }),
});

export const updateFeeSchema = z.object({
  params: z.object({ id }),
  body: z.object({
    name: z.string().trim().min(2).max(150).optional(),
    amount: amount.optional(),
    description: z.string().trim().max(500).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const createInvoiceSchema = z.object({
  body: z.object({ studentId: id, feeId: id, dueDate: z.coerce.date().optional().nullable() }),
});

export const createPaymentSchema = z.object({
  body: z.object({
    invoiceId: id,
    amount,
    method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY']),
    reference: z.string().trim().max(100).optional().nullable(),
  }),
});

export const createPaystackPaymentSchema = z.object({
  body: z.object({
    invoiceId: id,
    email: z.string().email(),
  }),
});

export const verifyPaystackPaymentSchema = z.object({
  params: z.object({ reference: z.string().trim().min(1).max(100) }),
});