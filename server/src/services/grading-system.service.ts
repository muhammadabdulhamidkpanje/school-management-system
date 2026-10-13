import type { Prisma } from '../generated/prisma/index.js';
import prisma from '../config/prisma.js';
import { ConflictError, NotFoundError } from '../errors/errors.js';

const getGradingSystem = async (id: string) => {
  const gradingSystem = await prisma.gradingSystem.findUnique({ where: { id } });
  if (!gradingSystem) throw new NotFoundError('Grading system');
  return gradingSystem;
};

export const listGradingSystems = () =>
  prisma.gradingSystem.findMany({ orderBy: { name: 'asc' } });

export const createGradingSystem = async (
  dto: { name: string; grades: Prisma.InputJsonValue },
  actorId: string,
  ipAddress?: string,
) => {
  if (await prisma.gradingSystem.findUnique({ where: { name: dto.name } })) {
    throw new ConflictError('Grading system name already exists');
  }
  const gradingSystem = await prisma.gradingSystem.create({ data: dto });
  await prisma.auditLog.create({
    data: {
      action: 'GRADING_SYSTEM_CREATED',
      userId: actorId,
      recordId: gradingSystem.id,
      ...(ipAddress !== undefined && { ipAddress }),
    },
  });
  return gradingSystem;
};

export const updateGradingSystem = async (
  id: string,
  dto: { name?: string; grades?: Prisma.InputJsonValue },
  actorId: string,
  ipAddress?: string,
) => {
  await getGradingSystem(id);
  if (dto.name) {
    const duplicate = await prisma.gradingSystem.findUnique({ where: { name: dto.name } });
    if (duplicate && duplicate.id !== id) throw new ConflictError('Grading system name already exists');
  }
  const gradingSystem = await prisma.gradingSystem.update({ where: { id }, data: dto });
  await prisma.auditLog.create({
    data: {
      action: 'GRADING_SYSTEM_UPDATED',
      userId: actorId,
      recordId: id,
      ...(ipAddress !== undefined && { ipAddress }),
    },
  });
  return gradingSystem;
};

export const deleteGradingSystem = async (id: string, actorId: string, ipAddress?: string) => {
  await getGradingSystem(id);
  await prisma.gradingSystem.delete({ where: { id } });
  await prisma.auditLog.create({
    data: {
      action: 'GRADING_SYSTEM_DELETED',
      userId: actorId,
      recordId: id,
      ...(ipAddress !== undefined && { ipAddress }),
    },
  });
};
