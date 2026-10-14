-- DropForeignKey
ALTER TABLE "course_offerings" DROP CONSTRAINT "course_offerings_courseId_fkey";

-- AlterTable
ALTER TABLE "admissions" ADD COLUMN     "applicantPhone" TEXT;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
