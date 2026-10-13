import * as ScoreRepo from '../repositories/score.repositories.js';
import type { CreateScoreDTO, UpdateScoreDTO } from '../types/assessment.types.js';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/errors.js';
import { calculateGrade } from '../utils/grade.js';
import { buildReportSummary } from '../utils/report-card.js';
import { assertResultEditable } from '../utils/result-lock.js';

const withGrade = <T extends { marks: number; assessment: { maxMarks: number } | null; exam: { totalMarks: number } | null }>(score: T) => ({
  ...score,
  grade: calculateGrade(score.marks, score.assessment?.maxMarks ?? score.exam?.totalMarks ?? 0),
});

const getScore = async (id: string) => {
  const score = await ScoreRepo.findById(id);
  if (!score) throw new NotFoundError('Score');
  return score;
};

const targetMaximum = async (dto: CreateScoreDTO) => {
  if (dto.assessmentId) {
    const assessment = await ScoreRepo.findAssessment(dto.assessmentId);
    if (!assessment) throw new NotFoundError('Assessment');
    assertResultEditable(assessment.isPublished);
    return assessment.maxMarks;
  }
  if (dto.examId) {
    const exam = await ScoreRepo.findExam(dto.examId);
    if (!exam) throw new NotFoundError('Exam');
    assertResultEditable(exam.isPublished);
    return exam.totalMarks;
  }
  throw new BadRequestError('Provide exactly one score target');
};

export const listScores = async ({ page, limit, studentId, assessmentId, examId }: {
  page: number; limit: number; studentId?: string; assessmentId?: string; examId?: string;
}) => {
  const [scores, total] = await ScoreRepo.listScores((page - 1) * limit, limit, {
    ...(studentId !== undefined && { studentId }),
    ...(assessmentId !== undefined && { assessmentId }),
    ...(examId !== undefined && { examId }),
  });
  return { scores: scores.map(withGrade), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const createScore = async (dto: CreateScoreDTO, actorId: string, ipAddress?: string) => {
  if (!(await ScoreRepo.findStudent(dto.studentId))) throw new NotFoundError('Student');
  const maximum = await targetMaximum(dto);
  if (dto.marks > maximum) throw new BadRequestError(`Marks cannot exceed ${maximum}`);
  if (await ScoreRepo.findExisting(dto.studentId, dto.assessmentId, dto.examId)) throw new ConflictError('Score already exists');
  const score = await ScoreRepo.create({
    student: { connect: { id: dto.studentId } },
    ...(dto.assessmentId !== undefined && { assessment: { connect: { id: dto.assessmentId } } }),
    ...(dto.examId !== undefined && { exam: { connect: { id: dto.examId } } }),
    marks: dto.marks,
    ...(dto.remarks !== undefined && { remarks: dto.remarks }),
  });
  await ScoreRepo.createAuditLog({
    action: 'SCORE_CREATED',
    userId: actorId,
    recordId: score.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return withGrade(score);
};

export const updateScore = async (id: string, dto: UpdateScoreDTO, actorId: string, ipAddress?: string) => {
  const existing = await getScore(id);
  assertResultEditable(existing.assessment?.isPublished === true || existing.exam?.isPublished === true);
  if (dto.marks !== undefined) {
    const maximum = existing.assessment?.maxMarks ?? existing.exam?.totalMarks;
    if (maximum !== undefined && dto.marks > maximum) throw new BadRequestError(`Marks cannot exceed ${maximum}`);
  }
  const score = await ScoreRepo.update(id, {
    ...(dto.marks !== undefined && { marks: dto.marks }),
    ...(dto.remarks !== undefined && { remarks: dto.remarks }),
  });
  await ScoreRepo.createAuditLog({
    action: 'SCORE_UPDATED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return withGrade(score);
};

export const getScoreById = async (id: string) => withGrade(await getScore(id));
export const deleteScore = async (id: string, actorId: string, ipAddress?: string) => {
  const existing = await getScore(id);
  assertResultEditable(existing.assessment?.isPublished === true || existing.exam?.isPublished === true);
  await ScoreRepo.remove(id);
  await ScoreRepo.createAuditLog({
    action: 'SCORE_DELETED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};

export const getStudentReportCard = async (studentId: string) => {
  const report = await ScoreRepo.findPublishedStudentReport(studentId);
  if (!report) throw new NotFoundError('Student');
  const scores = report.scores.map(withGrade);
  return {
    student: {
      id: report.id,
      admissionNo: report.admissionNo,
      firstName: report.firstName,
      lastName: report.lastName,
    },
    scores,
    summary: buildReportSummary(scores.map((score) => ({
      marks: score.marks,
      maxMarks: score.assessment?.maxMarks ?? score.exam?.totalMarks ?? 0,
    }))),
  };
};
