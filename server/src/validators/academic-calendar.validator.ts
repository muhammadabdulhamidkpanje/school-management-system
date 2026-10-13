import { z } from 'zod';

export const academicCalendarIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

const calendarFields = {
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).nullable().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  sessionId: z.string().cuid().nullable().optional(),
};

export const listAcademicCalendarsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sessionId: z.string().cuid().optional(),
  }),
});

export const createAcademicCalendarSchema = z.object({
  body: z.object(calendarFields),
});

export const updateAcademicCalendarSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    title: calendarFields.title.optional(),
    description: calendarFields.description,
    startDate: calendarFields.startDate.optional(),
    endDate: calendarFields.endDate.optional(),
    sessionId: calendarFields.sessionId,
  }),
});
