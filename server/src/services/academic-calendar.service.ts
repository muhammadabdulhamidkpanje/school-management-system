import prisma from '../config/prisma.js';
import { BadRequestError, NotFoundError } from '../errors/errors.js';

type CalendarInput = {
  title?: string;
  description?: string | null;
  startDate?: Date | string;
  endDate?: Date | string;
  sessionId?: string | null;
};

const getCalendarEvent = async (id: string) => {
  const event = await prisma.academicCalendar.findUnique({
    where: { id },
    include: { session: { select: { id: true, name: true } } },
  });
  if (!event) throw new NotFoundError('Academic calendar event');
  return event;
};

const asDate = (value: Date | string) => value instanceof Date ? value : new Date(value);

const validateDateRange = (startDate: Date, endDate: Date) => {
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new BadRequestError('Calendar event dates are invalid');
  }
  if (startDate >= endDate) {
    throw new BadRequestError('Calendar event start date must be before end date');
  }
};

export const listAcademicCalendars = async (
  page: number,
  limit: number,
  sessionId?: string,
) => {
  const where = sessionId ? { sessionId } : {};
  const [events, total] = await Promise.all([
    prisma.academicCalendar.findMany({
      ...(sessionId && { where }),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: 'asc' },
      include: { session: { select: { id: true, name: true } } },
    }),
    prisma.academicCalendar.count({ ...(sessionId && { where }) }),
  ]);
  return { events, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const createAcademicCalendar = async (
  dto: Required<Pick<CalendarInput, 'title' | 'startDate' | 'endDate'>> & CalendarInput,
  actorId: string,
  ipAddress?: string,
) => {
  const startDate = asDate(dto.startDate);
  const endDate = asDate(dto.endDate);
  validateDateRange(startDate, endDate);
  const event = await prisma.academicCalendar.create({
    data: {
      title: dto.title,
      startDate,
      endDate,
      ...(dto.description !== undefined && { description: dto.description || null }),
      ...(dto.sessionId && { session: { connect: { id: dto.sessionId } } }),
    },
  });
  await prisma.auditLog.create({
    data: {
      action: 'ACADEMIC_CALENDAR_CREATED',
      userId: actorId,
      recordId: event.id,
      ...(ipAddress !== undefined && { ipAddress }),
    },
  });
  return event;
};

export const updateAcademicCalendar = async (
  id: string,
  dto: CalendarInput,
  actorId: string,
  ipAddress?: string,
) => {
  const existing = await getCalendarEvent(id);
  const startDate = dto.startDate ? asDate(dto.startDate) : existing.startDate;
  const endDate = dto.endDate ? asDate(dto.endDate) : existing.endDate;
  validateDateRange(startDate, endDate);
  const event = await prisma.academicCalendar.update({
    where: { id },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description || null }),
      startDate,
      endDate,
      ...(dto.sessionId !== undefined && {
        session: dto.sessionId ? { connect: { id: dto.sessionId } } : { disconnect: true },
      }),
    },
    include: { session: { select: { id: true, name: true } } },
  });
  await prisma.auditLog.create({
    data: {
      action: 'ACADEMIC_CALENDAR_UPDATED',
      userId: actorId,
      recordId: id,
      ...(ipAddress !== undefined && { ipAddress }),
    },
  });
  return event;
};

export const deleteAcademicCalendar = async (id: string, actorId: string, ipAddress?: string) => {
  await getCalendarEvent(id);
  await prisma.academicCalendar.delete({ where: { id } });
  await prisma.auditLog.create({
    data: {
      action: 'ACADEMIC_CALENDAR_DELETED',
      userId: actorId,
      recordId: id,
      ...(ipAddress !== undefined && { ipAddress }),
    },
  });
};
