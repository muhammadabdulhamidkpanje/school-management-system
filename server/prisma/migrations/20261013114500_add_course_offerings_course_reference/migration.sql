ALTER TABLE "course_offerings"
  ALTER COLUMN "subjectId" DROP NOT NULL;

ALTER TABLE "course_offerings"
  ADD COLUMN "courseId" TEXT;

CREATE INDEX "course_offerings_courseId_idx"
  ON "course_offerings"("courseId");

CREATE UNIQUE INDEX "course_offerings_courseId_classroomId_semesterId_key"
  ON "course_offerings"("courseId", "classroomId", "semesterId");

ALTER TABLE "course_offerings"
  ADD CONSTRAINT "course_offerings_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
