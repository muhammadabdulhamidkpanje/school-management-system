-- CreateTable
CREATE TABLE "student_scores" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "examId" TEXT,
    "marks" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_scores_studentId_assessmentId_key" ON "student_scores"("studentId", "assessmentId");
CREATE UNIQUE INDEX "student_scores_studentId_examId_key" ON "student_scores"("studentId", "examId");
CREATE INDEX "student_scores_studentId_idx" ON "student_scores"("studentId");
CREATE INDEX "student_scores_assessmentId_idx" ON "student_scores"("assessmentId");
CREATE INDEX "student_scores_examId_idx" ON "student_scores"("examId");

-- AddForeignKey
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
