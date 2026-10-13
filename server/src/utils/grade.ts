export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface GradeResult {
  percentage: number;
  letter: GradeLetter;
}

export const calculateGrade = (marks: number, maxMarks: number): GradeResult => {
  if (!Number.isFinite(marks) || !Number.isFinite(maxMarks) || maxMarks <= 0 || marks < 0 || marks > maxMarks) {
    throw new Error('Marks must be between zero and the maximum marks');
  }

  const percentage = Math.round((marks / maxMarks) * 10000) / 100;
  const letter = percentage >= 70 ? 'A'
    : percentage >= 60 ? 'B'
      : percentage >= 50 ? 'C'
        : percentage >= 45 ? 'D'
          : percentage >= 40 ? 'E'
            : 'F';

  return { percentage, letter };
};
