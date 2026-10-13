CREATE TABLE "institution_profile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "institution_profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grading_systems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grades" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "grading_systems_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academic_calendars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "academic_calendars_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "grading_systems_name_key" ON "grading_systems"("name");
CREATE INDEX "academic_calendars_sessionId_idx" ON "academic_calendars"("sessionId");
CREATE INDEX "academic_calendars_startDate_idx" ON "academic_calendars"("startDate");

ALTER TABLE "academic_calendars"
    ADD CONSTRAINT "academic_calendars_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "sessions"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
