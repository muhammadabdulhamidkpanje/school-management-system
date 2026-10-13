-- Ensure the existing staff table is present for databases initialized before
-- staff was added to the migration history.
CREATE TABLE IF NOT EXISTS "staff" (
    "id" TEXT NOT NULL,
    "employeeNo" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "designation" TEXT,
    "employmentDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "UserProfile"
    ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "address" TEXT;

ALTER TABLE "staff"
    ADD COLUMN IF NOT EXISTS "employmentType" TEXT,
    ADD COLUMN IF NOT EXISTS "userId" TEXT,
    ADD COLUMN IF NOT EXISTS "departmentId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "staff_employeeNo_key" ON "staff"("employeeNo");
CREATE UNIQUE INDEX IF NOT EXISTS "staff_email_key" ON "staff"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "staff_userId_key" ON "staff"("userId");
CREATE INDEX IF NOT EXISTS "staff_departmentId_idx" ON "staff"("departmentId");
CREATE INDEX IF NOT EXISTS "staff_userId_idx" ON "staff"("userId");

CREATE TABLE IF NOT EXISTS "StaffQualification" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "documentPublicId" TEXT,
    "documentFileName" TEXT,
    "documentMimeType" TEXT,
    "documentFileSize" INTEGER,
    "documentResourceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffQualification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StaffQualification_staffId_idx"
    ON "StaffQualification"("staffId");

CREATE TABLE IF NOT EXISTS "StaffPrivateData" (
    "staffId" TEXT NOT NULL,
    "encryptedBankDetails" TEXT NOT NULL,
    CONSTRAINT "StaffPrivateData_pkey" PRIMARY KEY ("staffId")
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_userId_fkey') THEN
        ALTER TABLE "staff"
            ADD CONSTRAINT "staff_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_departmentId_fkey') THEN
        ALTER TABLE "staff"
            ADD CONSTRAINT "staff_departmentId_fkey"
            FOREIGN KEY ("departmentId") REFERENCES "departments"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_offerings_teacherId_fkey') THEN
        ALTER TABLE "course_offerings"
            ADD CONSTRAINT "course_offerings_teacherId_fkey"
            FOREIGN KEY ("teacherId") REFERENCES "staff"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StaffQualification_staffId_fkey') THEN
        ALTER TABLE "StaffQualification"
            ADD CONSTRAINT "StaffQualification_staffId_fkey"
            FOREIGN KEY ("staffId") REFERENCES "staff"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StaffPrivateData_staffId_fkey') THEN
        ALTER TABLE "StaffPrivateData"
            ADD CONSTRAINT "StaffPrivateData_staffId_fkey"
            FOREIGN KEY ("staffId") REFERENCES "staff"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END;
$$;
