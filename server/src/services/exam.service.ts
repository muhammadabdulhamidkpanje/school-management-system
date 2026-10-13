import * as ExamRepo from '../repositories/exam.repositories.js';
import type { CreateExamDTO, UpdateExamDTO } from '../types/assessment.types.js';
import { ConflictError, NotFoundError } from '../errors/errors.js';

const getExam = async (id: string) => {
  const exam = await ExamRepo.findExamById(id);
  if (!exam) throw new NotFoundError('Exam');
  return exam;
};

export const listExams = async ({ page, limit, courseOfferingId, search }: {
  page: number;
  limit: number;
  courseOfferingId?: string | undefined;
  search?: string | undefined;
}) => {
  const where: Record<string, unknown> = {};
  if (courseOfferingId) where.courseOfferingId = courseOfferingId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [exams, total] = await ExamRepo.listExams((page - 1) * limit, limit, where);
  return { exams, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getExamById = (id: string) => getExam(id);

export const createExam = async (dto: CreateExamDTO, actorId: string, ipAddress?: string) => {
  const offering = await ExamRepo.findOfferingById(dto.courseOfferingId);
  if (!offering) throw new NotFoundError('Course offering');

  const duplicate = await ExamRepo.findExamByTitle(dto.courseOfferingId, dto.title);
  if (duplicate) throw new ConflictError('Exam title already exists in this course offering');

  const exam = await ExamRepo.createExam({
    courseOffering: { connect: { id: dto.courseOfferingId } },
    title: dto.title,
    examType: dto.examType ?? 'FINAL',
    date: new Date(dto.date),
    durationMinutes: dto.durationMinutes ?? 60,
    totalMarks: dto.totalMarks ?? 100,
    ...(dto.venue !== undefined && dto.venue !== null ? { venue: dto.venue } : {}),
  });

  await ExamRepo.createAuditLog({
    action: 'EXAM_CREATED',
    userId: actorId,
    recordId: exam.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return exam;
};

export const updateExam = async (id: string, dto: UpdateExamDTO, actorId: string, ipAddress?: string) => {
  const existing = await getExam(id);

  if (dto.courseOfferingId) {
    const offering = await ExamRepo.findOfferingById(dto.courseOfferingId);
    if (!offering) throw new NotFoundError('Course offering');
  }

  if (dto.title) {
    const duplicate = await ExamRepo.findExamByTitle(dto.courseOfferingId ?? existing.courseOfferingId, dto.title);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Exam title already exists in this course offering');
  }

  const exam = await ExamRepo.updateExam(id, {
    ...(dto.courseOfferingId !== undefined && { courseOffering: { connect: { id: dto.courseOfferingId } } }),
    ...(dto.title !== undefined && { title: dto.title }),
    ...(dto.examType !== undefined && { examType: dto.examType }),
    ...(dto.date !== undefined && { date: new Date(dto.date) }),
    ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
    ...(dto.totalMarks !== undefined && { totalMarks: dto.totalMarks }),
    ...(dto.venue !== undefined && { venue: dto.venue }),
    ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
  });

  await ExamRepo.createAuditLog({
    action: 'EXAM_UPDATED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return exam;
};

export const deleteExam = async (id: string, actorId: string, ipAddress?: string) => {
  await getExam(id);
  await ExamRepo.deleteExam(id);
  await ExamRepo.createAuditLog({
    action: 'EXAM_DELETED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};

export const setExamPublication = async (id: string, published: boolean, actorId: string, ipAddress?: string) => {
  await getExam(id);
  const exam = await ExamRepo.updateExam(id, { isPublished: published });
  await ExamRepo.createAuditLog({
    action: published ? 'EXAM_PUBLISHED' : 'EXAM_UNPUBLISHED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return exam;
};
