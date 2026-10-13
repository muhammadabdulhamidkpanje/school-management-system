import * as AssessmentRepo from '../repositories/assessment.repositories.js';
import type { CreateAssessmentDTO, UpdateAssessmentDTO } from '../types/assessment.types.js';
import { ConflictError, NotFoundError } from '../errors/errors.js';

const getAssessment = async (id: string) => {
  const assessment = await AssessmentRepo.findAssessmentById(id);
  if (!assessment) throw new NotFoundError('Assessment');
  return assessment;
};

export const listAssessments = async ({ page, limit, courseOfferingId, search }: {
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

  const [assessments, total] = await AssessmentRepo.listAssessments((page - 1) * limit, limit, where);
  return { assessments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAssessmentById = (id: string) => getAssessment(id);

export const createAssessment = async (dto: CreateAssessmentDTO, actorId: string, ipAddress?: string) => {
  const offering = await AssessmentRepo.findOfferingById(dto.courseOfferingId);
  if (!offering) throw new NotFoundError('Course offering');

  const duplicate = await AssessmentRepo.findAssessmentByTitle(dto.courseOfferingId, dto.title);
  if (duplicate) throw new ConflictError('Assessment title already exists in this course offering');

  const assessment = await AssessmentRepo.createAssessment({
    courseOffering: { connect: { id: dto.courseOfferingId } },
    title: dto.title,
    type: dto.type ?? 'TEST',
    weight: dto.weight ?? 0,
    maxMarks: dto.maxMarks ?? 100,
    ...(dto.dueDate !== undefined && dto.dueDate !== null ? { dueDate: new Date(dto.dueDate) } : {}),
  });

  await AssessmentRepo.createAuditLog({
    action: 'ASSESSMENT_CREATED',
    userId: actorId,
    recordId: assessment.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return assessment;
};

export const updateAssessment = async (id: string, dto: UpdateAssessmentDTO, actorId: string, ipAddress?: string) => {
  const existing = await getAssessment(id);

  if (dto.courseOfferingId) {
    const offering = await AssessmentRepo.findOfferingById(dto.courseOfferingId);
    if (!offering) throw new NotFoundError('Course offering');
  }

  if (dto.title) {
    const duplicate = await AssessmentRepo.findAssessmentByTitle(dto.courseOfferingId ?? existing.courseOfferingId, dto.title);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Assessment title already exists in this course offering');
  }

  const assessment = await AssessmentRepo.updateAssessment(id, {
    ...(dto.courseOfferingId !== undefined && { courseOffering: { connect: { id: dto.courseOfferingId } } }),
    ...(dto.title !== undefined && { title: dto.title }),
    ...(dto.type !== undefined && { type: dto.type }),
    ...(dto.weight !== undefined && { weight: dto.weight }),
    ...(dto.maxMarks !== undefined && { maxMarks: dto.maxMarks }),
    ...(dto.dueDate !== undefined && { dueDate: dto.dueDate === null ? null : new Date(dto.dueDate) }),
    ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
  });

  await AssessmentRepo.createAuditLog({
    action: 'ASSESSMENT_UPDATED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return assessment;
};

export const deleteAssessment = async (id: string, actorId: string, ipAddress?: string) => {
  await getAssessment(id);
  await AssessmentRepo.deleteAssessment(id);
  await AssessmentRepo.createAuditLog({
    action: 'ASSESSMENT_DELETED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};

export const setAssessmentPublication = async (id: string, published: boolean, actorId: string, ipAddress?: string) => {
  await getAssessment(id);
  const assessment = await AssessmentRepo.updateAssessment(id, { isPublished: published });
  await AssessmentRepo.createAuditLog({
    action: published ? 'ASSESSMENT_PUBLISHED' : 'ASSESSMENT_UNPUBLISHED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return assessment;
};
