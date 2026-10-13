import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import DocumentUpload from "../features/admission/document";
import PersonalInfoForm from "../features/admission/personalInnfo";
import ResultsSection from "../features/admission/result";
import {
  resetAdmission,
  submitAdmission,
} from "../features/admission/admissionSlice";

const REQUIRED_DOCUMENTS = [
  "passport",
  "birthCert",
  "schoolResult",
  "medicalReport",
];

const validateStep = (step, admission) => {
  if (step === 1) {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "dateOfBirth",
      "gender",
      "nationality",
      "stateOfOrigin",
      "lga",
    ];
    if (requiredFields.some((field) => !admission[field]?.trim())) {
      return "Complete all required personal information fields.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admission.email)) {
      return "Enter a valid email address.";
    }
    const birthDate = new Date(`${admission.dateOfBirth}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(admission.dateOfBirth) ||
      Number.isNaN(birthDate.getTime()) ||
      birthDate.toISOString().slice(0, 10) !== admission.dateOfBirth
    ) {
      return "Enter a valid date of birth.";
    }
  }

  if (step === 2) {
    if (
      !String(admission.academicSessionId || "").trim() ||
      !String(admission.classId || "").trim() ||
      !String(admission.english || "").trim() ||
      !String(admission.math || "").trim()
    ) {
      return "Select an academic session and class, then enter English and Mathematics grades.";
    }

    const requiredSubjects = admission.requiredAdmissionSubjects || [
      "English",
      "Mathematics",
    ];
    const missingRequiredGrade = requiredSubjects.some((subject) => {
      const normalized = subject.toLowerCase();
      const grade =
        normalized === "english"
          ? admission.english
          : ["mathematics", "math"].includes(normalized)
            ? admission.math
            : admission.requiredResults?.[normalized];
      return !String(grade || "").trim();
    });
    if (missingRequiredGrade) {
      return "Enter a grade for every subject required by the selected session.";
    }

    const extraCourses = Array.isArray(admission.extraCourses)
      ? admission.extraCourses
      : [];
    const subjects = [
      ...requiredSubjects,
      ...extraCourses
        .filter((result) => result.course.trim())
        .map((result) => result.course.trim()),
    ];
    const normalizedSubjects = subjects.map((subject) => subject.toLowerCase());
    if (new Set(normalizedSubjects).size !== normalizedSubjects.length) {
      return "Each academic subject can only be entered once.";
    }
    if (
      requiredSubjects.length +
        extraCourses.filter((result) => result.course.trim() && result.grade.trim()).length >
      20
    ) {
      return "You can submit no more than 20 academic results.";
    }
    if (
      extraCourses.some(
        (result) => Boolean(result.course.trim()) !== Boolean(result.grade.trim()),
      )
    ) {
      return "Enter both a subject and grade for each additional result.";
    }
  }

  if (step === 3) {
    const documents = admission.documents || {};
    if (REQUIRED_DOCUMENTS.some((field) => !documents[field])) {
      return "Upload the passport, birth certificate, school result, and medical report.";
    }
    const additionalDocuments = admission.additionalDocuments || [];
    const documentTypes = additionalDocuments.map((document) =>
      document.documentType.trim(),
    );
    if (
      additionalDocuments.some(
        (document, index) =>
          !/^[A-Z0-9_]+$/.test(document.documentType.trim()) ||
          !documents[`additional:${document.id}`] ||
          documentTypes.indexOf(documentTypes[index]) !== index,
      )
    ) {
      return "Each additional document needs a unique document type and an uploaded file.";
    }
    if (Object.keys(documents).length > 20) {
      return "You can submit no more than 20 documents.";
    }
    if (Object.values(admission.uploadingDocuments || {}).some(Boolean)) {
      return "Wait for all document uploads to finish before submitting.";
    }
  }

  return null;
};

const makeSubmissionPayload = (admission) => ({
  firstName: admission.firstName.trim(),
  middleName: admission.middleName?.trim() || undefined,
  lastName: admission.lastName.trim(),
  email: admission.email.trim(),
  dateOfBirth: admission.dateOfBirth,
  gender: admission.gender,
  nationality: admission.nationality.trim(),
  stateOfOrigin: admission.stateOfOrigin.trim(),
  lga: admission.lga.trim(),
  religion: admission.religion?.trim() || undefined,
  academicSessionId: admission.academicSessionId.trim(),
  classId: admission.classId.trim(),
  results: [
    { subject: "English", grade: admission.english.trim() },
    { subject: "Mathematics", grade: admission.math.trim() },
    ...(Array.isArray(admission.requiredAdmissionSubjects)
      ? admission.requiredAdmissionSubjects
      : []
    )
      .filter(
        (subject) =>
          !["english", "mathematics", "math"].includes(subject.toLowerCase()),
      )
      .map((subject) => ({
        subject,
        grade: admission.requiredResults?.[subject.toLowerCase()]?.trim() || "",
      })),
    ...(Array.isArray(admission.extraCourses) ? admission.extraCourses : [])
      .filter((result) => result.course.trim() && result.grade.trim())
      .map((result) => ({
        subject: result.course.trim(),
        grade: result.grade.trim(),
      })),
  ],
  documents: Object.values(admission.documents || {}).map((document) => ({
    documentType: document.documentType,
    fileName: document.fileName,
    fileUrl: document.fileUrl,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    publicId: document.publicId,
    resourceType: document.resourceType,
    claimToken: document.claimToken,
  })),
});

export default function Admission() {
  const dispatch = useDispatch();
  const admission = useSelector((state) => state.admission);
  const [step, setStep] = useState(1);

  const handleNext = () => {
    const error = validateStep(step, admission);
    if (error) {
      toast.error(error);
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
  };

  const handleSubmit = async () => {
    for (const currentStep of [1, 2, 3]) {
      const error = validateStep(currentStep, admission);
      if (error) {
        setStep(currentStep);
        toast.error(error);
        return;
      }
    }

    try {
      const result = await dispatch(
        submitAdmission(makeSubmissionPayload(admission)),
      ).unwrap();
      toast.success("Admission submitted successfully");
      if (result?.applicationNumber) {
        toast.message(`Application number: ${result.applicationNumber}`);
      }
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to submit admission.",
      );
    }
  };

  const handleStartNew = () => {
    dispatch(resetAdmission());
    setStep(1);
  };

  if (admission.status === "succeeded" && admission.submission) {
    const { applicationNumber, id, status, createdAt } = admission.submission;
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <section className="mx-auto mt-12 max-w-2xl rounded bg-white p-8 text-center shadow-md">
          <h1 className="mb-3 text-2xl font-bold text-green-700">
            Application submitted
          </h1>
          <p className="text-gray-700">
            Your admission application has been received.
          </p>
          {applicationNumber && (
            <p className="mt-4 font-semibold">
              Application number: {applicationNumber}
            </p>
          )}
          {id && (
            <Link
              to={`/admission/status/${id}`}
              className="mt-4 inline-block text-blue-700 underline"
            >
              Track application status
            </Link>
          )}
          {status && <p className="mt-2 text-sm text-gray-600">Status: {status}</p>}
          {createdAt && (
            <p className="mt-1 text-sm text-gray-600">
              Submitted: {new Date(createdAt).toLocaleString()}
            </p>
          )}
          {!applicationNumber && id && (
            <p className="mt-2 text-sm text-gray-600">Reference: {id}</p>
          )}
          <button
            type="button"
            onClick={handleStartNew}
            className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Submit another application
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Admission Application</h1>
          <p className="mt-1 text-sm text-gray-600">Step {step} of 3</p>
          <div
            className="mt-3 h-2 rounded bg-gray-200"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={step}
            aria-label="Admission application progress"
          >
            <div
              className="h-2 rounded bg-blue-600 transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </header>

        {step === 1 && <PersonalInfoForm />}
        {step === 2 && <ResultsSection />}
        {step === 3 && <DocumentUpload />}

        {admission.error && (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {admission.error}
          </p>
        )}

        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(current - 1, 1))}
              disabled={admission.status === "loading"}
              className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={admission.status === "loading"}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-wait disabled:opacity-50"
            >
              {admission.status === "loading" ? "Submitting..." : "Submit application"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
