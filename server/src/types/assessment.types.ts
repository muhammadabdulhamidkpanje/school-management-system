export const assessmentTypes = ['TEST', 'QUIZ', 'ASSIGNMENT', 'PROJECT', 'EXAM', 'PRESENTATION', 'OTHER'] as const;
export type AssessmentType = (typeof assessmentTypes)[number];

export interface CreateAssessmentDTO {
  courseOfferingId: string;
  title: string;
  type?: AssessmentType;
  weight?: number;
  maxMarks?: number;
  dueDate?: string | Date | null;
}

export interface UpdateAssessmentDTO {
  courseOfferingId?: string;
  title?: string;
  type?: AssessmentType;
  weight?: number;
  maxMarks?: number;
  dueDate?: string | Date | null;
  isPublished?: boolean;
}

export const examTypes = ['QUIZ', 'MIDTERM', 'FINAL', 'PRACTICAL', 'ORAL', 'OTHER'] as const;
export type ExamType = (typeof examTypes)[number];

export interface CreateExamDTO {
  courseOfferingId: string;
  title: string;
  examType?: ExamType;
  date: string | Date;
  durationMinutes?: number;
  totalMarks?: number;
  venue?: string | null;
}

export interface UpdateExamDTO {
  courseOfferingId?: string;
  title?: string;
  examType?: ExamType;
  date?: string | Date;
  durationMinutes?: number;
  totalMarks?: number;
  venue?: string | null;
  isPublished?: boolean;
}

export interface CreateScoreDTO {
  studentId: string;
  assessmentId?: string;
  examId?: string;
  marks: number;
  remarks?: string | null;
}

export interface UpdateScoreDTO {
  marks?: number;
  remarks?: string | null;
}
