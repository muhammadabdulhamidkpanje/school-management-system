import assert from 'node:assert/strict';
import { test } from 'node:test';

import { updateInstitutionProfileSchema } from '../src/validators/institution.validator.js';
import { createGradingSystemSchema } from '../src/validators/grading-system.validator.js';
import {
  createAcademicCalendarSchema,
  listAcademicCalendarsSchema,
} from '../src/validators/academic-calendar.validator.js';

test('institution profile validator accepts profile details and coordinates', () => {
  const parsed = updateInstitutionProfileSchema.parse({
    body: {
      name: 'North Star School',
      email: 'office@example.com',
      address: '12 School Road',
      phone: '+2348000000000',
      latitude: 6.45,
      longitude: 3.4,
    },
  });

  assert.equal(parsed.body.name, 'North Star School');
  assert.equal(parsed.body.latitude, 6.45);
});

test('institution profile validator rejects coordinates outside valid ranges', () => {
  assert.throws(() => updateInstitutionProfileSchema.parse({
    body: { name: 'North Star School', latitude: 95 },
  }));
});

test('grading system validator accepts score bands and rejects reversed ranges', () => {
  const parsed = createGradingSystemSchema.parse({
    body: {
      name: 'Standard',
      grades: [
        { grade: 'A', minScore: 80, maxScore: 100, remark: 'Excellent' },
        { grade: 'B', minScore: 70, maxScore: 79 },
      ],
    },
  });

  assert.equal(parsed.body.grades.length, 2);
  assert.throws(() => createGradingSystemSchema.parse({
    body: {
      name: 'Invalid',
      grades: [{ grade: 'A', minScore: 90, maxScore: 80 }],
    },
  }));
});

test('academic calendar validator accepts date ranges and session filters', () => {
  const parsed = createAcademicCalendarSchema.parse({
    body: {
      title: 'First term begins',
      description: 'Opening of the first term',
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      sessionId: 'cm8nc5s8n0000m8f7u0s3t4p5',
    },
  });
  const filters = listAcademicCalendarsSchema.parse({
    query: { page: '1', limit: '20', sessionId: 'cm8nc5s8n0000m8f7u0s3t4p5' },
  });

  assert.equal(parsed.body.startDate instanceof Date, true);
  assert.equal(filters.query.limit, 20);
});
