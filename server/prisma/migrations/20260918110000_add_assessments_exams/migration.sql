CREATE TYPE "AssessmentType" AS ENUM (
    'TEST',
    'QUIZ',
    'ASSIGNMENT',
    'PROJECT',
    'EXAM',
    'PRESENTATION',
    'OTHER'
);

CREATE TYPE "ExamType" AS ENUM (
    'QUIZ',
    'MIDTERM',
    'FINAL',
    'PRACTICAL',
    'ORAL',
    'OTHER'
);

CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL DEFAULT 'TEST',
    "weight" INTEGER NOT NULL DEFAULT 0,
    "maxMarks" INTEGER NOT NULL DEFAULT 100,
    "dueDate" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL DEFAULT 'FINAL',
    "date" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "totalMarks" INTEGER NOT NULL DEFAULT 100,
    "venue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "assessments_courseOfferingId_title_key"
    ON "assessments"("courseOfferingId", "title");
CREATE INDEX "assessments_courseOfferingId_idx" ON "assessments"("courseOfferingId");
CREATE INDEX "assessments_type_idx" ON "assessments"("type");

CREATE UNIQUE INDEX "exams_courseOfferingId_title_key"
    ON "exams"("courseOfferingId", "title");
CREATE INDEX "exams_courseOfferingId_idx" ON "exams"("courseOfferingId");
CREATE INDEX "exams_examType_idx" ON "exams"("examType");

ALTER TABLE "assessments"
    ADD CONSTRAINT "assessments_courseOfferingId_fkey"
        FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "exams"
    ADD CONSTRAINT "exams_courseOfferingId_fkey"
        FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
