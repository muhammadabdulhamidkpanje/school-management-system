ALTER TYPE "AdmissionStatus" ADD VALUE 'UNDER_REVIEW';
ALTER TYPE "AdmissionStatus" ADD VALUE 'MORE_INFORMATION_REQUIRED';
ALTER TYPE "AdmissionStatus" ADD VALUE 'WITHDRAWN';
ALTER TYPE "AdmissionStatus" ADD VALUE 'ENROLLED';

CREATE TYPE "AdmissionInformationRequestType" AS ENUM (
    'DOCUMENT',
    'PERSONAL_INFORMATION',
    'ACADEMIC_INFORMATION',
    'ACADEMIC_RESULT',
    'CORRECTION',
    'OTHER'
);

CREATE TYPE "AdmissionInformationRequestStatus" AS ENUM (
    'OPEN',
    'SUBMITTED',
    'RESOLVED',
    'CANCELLED'
);

ALTER TABLE "sessions"
    ADD COLUMN "admissionsOpen" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "requiredAdmissionSubjects" TEXT[] NOT NULL DEFAULT ARRAY['English', 'Mathematics']::TEXT[];

ALTER TABLE "classrooms"
    ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "admissions"
    ADD COLUMN "requestedClassId" TEXT,
    ADD COLUMN "approvedClassId" TEXT,
    ADD COLUMN "applicationNumber" TEXT,
    ADD COLUMN "applicantTokenHash" TEXT;

CREATE UNIQUE INDEX "admissions_applicationNumber_key" ON "admissions"("applicationNumber");
CREATE UNIQUE INDEX "admissions_applicantTokenHash_key" ON "admissions"("applicantTokenHash");
CREATE INDEX "admissions_requestedClassId_idx" ON "admissions"("requestedClassId");
CREATE INDEX "admissions_approvedClassId_idx" ON "admissions"("approvedClassId");

ALTER TABLE "admissions"
    ADD CONSTRAINT "admissions_requestedClassId_fkey"
        FOREIGN KEY ("requestedClassId") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "admissions_approvedClassId_fkey"
        FOREIGN KEY ("approvedClassId") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "session_classrooms" (
    "sessionId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    CONSTRAINT "session_classrooms_pkey" PRIMARY KEY ("sessionId", "classroomId")
);
CREATE INDEX "session_classrooms_classroomId_idx" ON "session_classrooms"("classroomId");
ALTER TABLE "session_classrooms"
    ADD CONSTRAINT "session_classrooms_sessionId_fkey"
        FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "session_classrooms_classroomId_fkey"
        FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "admission_results" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admission_results_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "admission_results_admissionId_subject_key" ON "admission_results"("admissionId", "subject");
CREATE INDEX "admission_results_admissionId_idx" ON "admission_results"("admissionId");
ALTER TABLE "admission_results"
    ADD CONSTRAINT "admission_results_admissionId_fkey"
        FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "admission_information_requests" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "type" "AdmissionInformationRequestType" NOT NULL,
    "field" TEXT,
    "documentType" TEXT,
    "message" TEXT NOT NULL,
    "status" "AdmissionInformationRequestStatus" NOT NULL DEFAULT 'OPEN',
    "response" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admission_information_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "admission_information_requests_admissionId_status_idx" ON "admission_information_requests"("admissionId", "status");
CREATE INDEX "admission_information_requests_requestedById_idx" ON "admission_information_requests"("requestedById");
ALTER TABLE "admission_information_requests"
    ADD CONSTRAINT "admission_information_requests_admissionId_fkey"
        FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "admission_information_requests_requestedById_fkey"
        FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "admission_documents" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "publicId" TEXT,
    "resourceType" TEXT,
    "informationRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admission_documents_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "admission_documents_admissionId_idx" ON "admission_documents"("admissionId");
CREATE INDEX "admission_documents_documentType_idx" ON "admission_documents"("documentType");
CREATE UNIQUE INDEX "admission_documents_publicId_key" ON "admission_documents"("publicId");
ALTER TABLE "admission_documents"
    ADD CONSTRAINT "admission_documents_admissionId_fkey"
        FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "admission_documents_informationRequestId_fkey"
        FOREIGN KEY ("informationRequestId") REFERENCES "admission_information_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "admission_status_history" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "oldStatus" "AdmissionStatus",
    "newStatus" "AdmissionStatus" NOT NULL,
    "reason" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admission_status_history_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "admission_status_history_admissionId_createdAt_idx" ON "admission_status_history"("admissionId", "createdAt");
CREATE INDEX "admission_status_history_changedBy_idx" ON "admission_status_history"("changedBy");
ALTER TABLE "admission_status_history"
    ADD CONSTRAINT "admission_status_history_admissionId_fkey"
        FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "enrollments"
    ADD COLUMN "admissionId" TEXT;
CREATE UNIQUE INDEX "enrollments_admissionId_key" ON "enrollments"("admissionId");
ALTER TABLE "enrollments"
    ADD CONSTRAINT "enrollments_admissionId_fkey"
        FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
