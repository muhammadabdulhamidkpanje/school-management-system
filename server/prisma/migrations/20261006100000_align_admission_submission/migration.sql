ALTER TABLE "admissions"
    ALTER COLUMN "sessionId" DROP NOT NULL,
    ADD COLUMN "applicantMiddleName" TEXT,
    ADD COLUMN "email" TEXT,
    ADD COLUMN "dateOfBirth" TIMESTAMP(3),
    ADD COLUMN "gender" TEXT,
    ADD COLUMN "nationality" TEXT,
    ADD COLUMN "state" TEXT,
    ADD COLUMN "lga" TEXT,
    ADD COLUMN "religion" TEXT;

CREATE INDEX "admissions_email_idx" ON "admissions"("email");
