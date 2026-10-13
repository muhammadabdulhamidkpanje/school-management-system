import prisma from '../config/prisma.js';
import { Prisma } from '../generated/prisma/index.js';

const invoiceInclude = {
  student: true,
  fee: true,
  payments: { orderBy: { paidAt: 'desc' } },
} satisfies Prisma.FeeInvoiceInclude;

export const listFees = (skip: number, take: number) => Promise.all([
  prisma.fee.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
  prisma.fee.count(),
]);
export const findFeeById = (id: string) => prisma.fee.findUnique({ where: { id } });
export const findFeeByCode = (code: string) => prisma.fee.findUnique({ where: { code } });
export const createFee = (data: Prisma.FeeCreateInput) => prisma.fee.create({ data });
export const updateFee = (id: string, data: Prisma.FeeUpdateInput) => prisma.fee.update({ where: { id }, data });
export const deleteFee = (id: string) => prisma.fee.delete({ where: { id } });

export const listInvoices = (skip: number, take: number, where: Prisma.FeeInvoiceWhereInput) => Promise.all([
  prisma.feeInvoice.findMany({ skip, take, where, orderBy: { createdAt: 'desc' }, include: invoiceInclude }),
  prisma.feeInvoice.count({ where }),
]);
export const findStudent = (id: string) => prisma.student.findUnique({ where: { id }, select: { id: true } });
export const findInvoice = (id: string) => prisma.feeInvoice.findUnique({ where: { id }, include: invoiceInclude });
export const findPaymentByReference = (reference: string) => prisma.feePayment.findUnique({ where: { reference } });
export const findInvoiceByStudentAndFee = (studentId: string, feeId: string) => prisma.feeInvoice.findUnique({ where: { studentId_feeId: { studentId, feeId } } });
export const createInvoice = (data: Prisma.FeeInvoiceCreateInput) => prisma.feeInvoice.create({ data, include: invoiceInclude });

export const recordPayment = async (invoiceId: string, data: Prisma.FeePaymentCreateWithoutInvoiceInput) => prisma.$transaction(async (tx) => {
  const invoice = await tx.feeInvoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
  if (!invoice) return null;
  const paidBefore = invoice.payments.reduce((sum: Prisma.Decimal, payment: { amount: Prisma.Decimal }) => sum.plus(payment.amount), new Prisma.Decimal(0));
  const totalPaid = paidBefore.plus(new Prisma.Decimal(Number(data.amount)));
  const status = totalPaid.gte(invoice.amount) ? 'PAID' : 'PARTIALLY_PAID';
  await tx.feePayment.create({ data: { ...data, invoice: { connect: { id: invoiceId } } } });
  return tx.feeInvoice.update({ where: { id: invoiceId }, data: { status }, include: invoiceInclude });
});

export const createAuditLog = (data: { action: string; userId: string; recordId?: string; ipAddress?: string }) => prisma.auditLog.create({ data });
