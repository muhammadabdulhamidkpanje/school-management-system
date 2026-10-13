import { calculateGrade, type GradeLetter } from './grade.js';

export interface ReportScore {
  marks: number;
  maxMarks: number;
}

export interface ReportSummary {
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  letter: GradeLetter;
}

export const buildReportSummary = (scores: ReportScore[]): ReportSummary => {
  const totalMarks = scores.reduce((total, score) => total + score.marks, 0);
  const maxMarks = scores.reduce((total, score) => total + score.maxMarks, 0);
  const grade = calculateGrade(totalMarks, maxMarks);
  return { totalMarks, maxMarks, percentage: grade.percentage, letter: grade.letter };
};