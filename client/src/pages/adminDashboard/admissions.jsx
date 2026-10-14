import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingButton from "../../components/button/loadingButton";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/apiError";

const REQUEST_TYPES = [
  "DOCUMENT",
  "PERSONAL_INFORMATION",
  "ACADEMIC_INFORMATION",
  "ACADEMIC_RESULT",
  "CORRECTION",
  "OTHER",
];
const DOCUMENT_TYPES = [
  "PASSPORT",
  "BIRTH_CERTIFICATE",
  "SCHOOL_RESULT",
  "MEDICAL_REPORT",
  "INDIGENE_CERTIFICATE",
  "TRANSFER_CERTIFICATE",
];

function getAdmissions(data) {
  const list = data?.data?.admissions ?? data?.data ?? data?.admissions;
  if (!Array.isArray(list)) {
    throw new Error("The admissions list response was not valid.");
  }
  return list;
}

function getAdmission(data) {
  const admission =
    data?.data?.admission ??
    data?.data?.data?.admission ??
    data?.data?.data ??
    data?.data?.admission ??
    data?.data ??
    data;
  if (!admission || typeof admission !== "object" || !admission.id) {
    throw new Error("The admission detail response was not valid.");
  }
  return admission;
}

function getRequestError(error) {
  return error instanceof Error && !error.isAxiosError
    ? error.message
    : getErrorMessage(error);
}

function getRequests(admission) {
  const requests = admission?.informationRequests ?? admission?.requests ?? [];
  return Array.isArray(requests) ? requests : [];
}

export default function AdmissionsManagement() {
  const [admissions, setAdmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [enrollmentCredentials, setEnrollmentCredentials] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [classOptionsError, setClassOptionsError] = useState("");
  const [activeTab, setActiveTab] = useState("applicant");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [workingAction, setWorkingAction] = useState("");
  const [openingAdmissionId, setOpeningAdmissionId] = useState("");
  const [error, setError] = useState("");
  const [classId, setClassId] = useState("");
  const [reason, setReason] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestType, setRequestType] = useState("DOCUMENT");
  const [requestField, setRequestField] = useState("");
  const [documentType, setDocumentType] = useState("BIRTH_CERTIFICATE");

  const loadAdmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admissions");
      setAdmissions(getAdmissions(data));
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmissions();
  }, [loadAdmissions]);

  const openAdmission = async (id, resetTab = true) => {
    if (selected?.id !== id) setEnrollmentCredentials(null);
    setOpeningAdmissionId(id);
    setError("");
    setClassOptionsError("");
    try {
      const admissionResponse = await api.get(`/admissions/${id}`);
      const admission = getAdmission(admissionResponse.data);
      setSelected(admission);
      setClassOptions([]);
      setClassId("");
      if (resetTab) setActiveTab("applicant");
      setReason("");
      setRequestMessage("");
      if (["UNDER_REVIEW", "MORE_INFORMATION_REQUIRED"].includes(String(admission.status).toUpperCase())) {
        try {
          const classesResponse = await api.get(`/admissions/${id}/class-options`);
          const options =
            classesResponse.data?.data?.classrooms ??
            classesResponse.data?.data;
          if (!Array.isArray(options)) {
            throw new Error("The available classes response was not valid.");
          }
          setClassOptions(options);
          const requestedClassId = admission.approvedClassId || admission.requestedClassId || "";
          setClassId(
            options.some((classroom) => classroom.id === requestedClassId)
              ? requestedClassId
              : "",
          );
        } catch (optionsError) {
          setClassOptionsError(getRequestError(optionsError));
        }
      }
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setOpeningAdmissionId("");
    }
  };

  const runAction = async (action, payload = {}) => {
    if (!selected?.id || working) return;
    setWorking(true);
    setWorkingAction(action);
    setError("");
    try {
      const response = await api.post(`/admissions/${selected.id}/${action}`, payload);
      if (action === "enroll") {
        setEnrollmentCredentials(response.data?.data?.credentials ?? null);
      }
      toast.success(action === "enroll" ? "Student enrolled successfully." : "Admission updated successfully.");
      await loadAdmissions();
      await openAdmission(selected.id, false);
    } catch (requestError) {
      const message = getRequestError(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setWorking(false);
      setWorkingAction("");
    }
  };

  const handleRequestInformation = () => {
    if (!requestMessage.trim()) {
      toast.error("Enter the information or document being requested.");
      return;
    }
    const item = {
      type: requestType,
      message: requestMessage.trim(),
      ...(requestType === "DOCUMENT" ? { documentType } : {}),
      ...(["PERSONAL_INFORMATION", "ACADEMIC_INFORMATION", "ACADEMIC_RESULT", "CORRECTION"].includes(requestType) && requestField.trim()
        ? { field: requestField.trim() }
        : {}),
    };
    runAction("request-information", {
      message: requestMessage.trim(),
      items: [item],
    });
  };

  const currentStatus = String(selected?.status || "").toUpperCase();
  const canReview = currentStatus === "PENDING";
  const canDecide = ["UNDER_REVIEW", "MORE_INFORMATION_REQUIRED"].includes(currentStatus);
  const requests = getRequests(selected);
  const tabs = [
    ["applicant", "Applicant"],
    ["academic", "Academic"],
    ["documents", "Documents"],
    ["decision", "Decision & requests"],
  ];

  return (
    <main className="space-y-6 p-4">
      <header>
        <h1 className="text-2xl font-bold">Admission applications</h1>
        <p className="mt-1 text-sm text-gray-600">Review applications and record decisions.</p>
      </header>

      {error && <p role="alert" className="rounded bg-red-50 p-3 text-red-800">{error}</p>}

      <section className="rounded bg-white p-4 shadow">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Applications</h2>
          <LoadingButton
            type="button"
            onClick={loadAdmissions}
            isLoading={loading}
            loadingText="Refreshing..."
            className="border px-3 py-1 text-sm"
          >
            Refresh
          </LoadingButton>
        </div>
        {loading ? (
          <p>Loading applications...</p>
        ) : admissions.length === 0 ? (
          <p className="text-gray-600">No applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="p-2">Application</th>
                  <th className="p-2">Applicant</th>
                  <th className="p-2">Requested class</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((application) => (
                  <tr key={application.id} className="border-b">
                    <td className="p-2">
                      {application.applicationNumber || application.id}
                    </td>
                    <td className="p-2">
                      {[application.applicantFirstName || application.firstName, application.applicantLastName || application.lastName].filter(Boolean).join(" ") ||
                        application.applicantName ||
                        application.email}
                    </td>
                    <td className="p-2">
                      {application.requestedClass?.name ||
                        application.requestedClassId ||
                        application.classId ||
                        "—"}
                    </td>
                    <td className="p-2">{application.status || "—"}</td>
                    <td className="p-2">
                      <LoadingButton
                        type="button"
                        onClick={() => openAdmission(application.id)}
                        isLoading={openingAdmissionId === application.id}
                        loadingText="Opening..."
                        className="text-blue-700 underline"
                      >
                        Review
                      </LoadingButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <section className="space-y-5 rounded bg-white p-5 shadow">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                {selected.applicationNumber || selected.id}
              </h2>
              <p className="text-gray-600">
                {[selected.applicantFirstName || selected.firstName, selected.applicantMiddleName || selected.middleName, selected.applicantLastName || selected.lastName]
                  .filter(Boolean)
                  .join(" ")}{" "}
                · {selected.email}
              </p>
            </div>
            <span className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
              {selected.status}
            </span>
          </header>

          <div role="tablist" aria-label="Application review sections" className="flex flex-wrap gap-2 border-b">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                id={`admission-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                aria-controls="admission-review-panel"
                onClick={() => setActiveTab(id)}
                className={`border-b-2 px-3 py-2 text-sm font-medium ${
                  activeTab === id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {enrollmentCredentials && (
            <div className="mt-4 rounded border border-green-300 bg-green-50 p-4 text-sm text-green-950">
              <h3 className="font-semibold">Student login details</h3>
              <p className="mt-1">Share these credentials securely with the student.</p>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="font-medium">Email</dt>
                  <dd>{enrollmentCredentials.email}</dd>
                </div>
                <div>
                  <dt className="font-medium">Initial password (phone number)</dt>
                  <dd>{enrollmentCredentials.initialPassword}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs">The student should change this default password after signing in.</p>
            </div>
          )}

          <div
            id="admission-review-panel"
            role="tabpanel"
            aria-labelledby={`admission-tab-${activeTab}`}
            className="min-h-40"
          >
            {activeTab === "applicant" && (
              <div>
                <h3 className="font-semibold">Applicant information</h3>
                <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    ["Date of birth", selected.dateOfBirth],
                    ["Phone", selected.applicantPhone],
                    ["Gender", selected.gender],
                    ["Nationality", selected.nationality],
                    ["State of origin", selected.state],
                    ["LGA", selected.lga],
                    ["Religion", selected.religion],
                    ["Academic session", selected.session?.name || selected.sessionId],
                    ["Requested class", selected.requestedClass?.name || selected.requestedClassId],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-medium">{label}</dt>
                      <dd>{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {activeTab === "academic" && (
              <div>
                <h3 className="font-semibold">Academic results</h3>
                {Array.isArray(selected.results) && selected.results.length ? (
                  <ul className="mt-2 space-y-1 text-sm">
                    {selected.results.map((result, index) => (
                      <li key={`${result.subject}-${index}`}>
                        {result.subject}: {result.grade}
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-sm text-gray-600">No results supplied.</p>}
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                <h3 className="font-semibold">Documents</h3>
                {Array.isArray(selected.uploadedDocuments) && selected.uploadedDocuments.length ? (
                  <ul className="mt-2 flex flex-wrap gap-3 text-sm">
                    {selected.uploadedDocuments.map((document, index) => (
                      <li key={`${document.documentType}-${index}`}>
                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 underline"
                        >
                          {document.documentType}: {document.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-sm text-gray-600">No documents supplied.</p>}
              </div>
            )}

            {activeTab === "decision" && (
              <div className="space-y-5">
                {requests.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Information requests</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {requests.map((request) => (
                        <li key={request.id} className="rounded border p-3">
                          <p>{request.type}{request.documentType ? ` · ${request.documentType}` : ""}</p>
                          <p>{request.message}</p>
                          <p className="text-gray-600">
                            {request.status}
                            {request.response ? ` · Applicant: ${request.response}` : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          {activeTab === "decision" && <div className="space-y-4 border-t pt-4">
            {canReview && (
              <LoadingButton
                type="button"
                onClick={() => runAction("review")}
                isLoading={workingAction === "review"}
                loadingText="Moving to review..."
                disabled={working}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                Move to review
              </LoadingButton>
            )}

            {canDecide && (
              <>
                <div className="space-y-3 rounded border p-4">
                  <h3 className="font-semibold">Request more information</h3>
                  <textarea
                    value={requestMessage}
                    onChange={(event) => setRequestMessage(event.target.value)}
                    placeholder="Describe the information or document needed"
                    rows={3}
                    className="block w-full rounded border p-2"
                  />
                  <div className="grid gap-3 md:grid-cols-3">
                    <select
                      value={requestType}
                      onChange={(event) => setRequestType(event.target.value)}
                      className="rounded border p-2"
                      aria-label="Request type"
                    >
                      {REQUEST_TYPES.map((type) => <option key={type}>{type}</option>)}
                    </select>
                    {requestType === "DOCUMENT" ? (
                      <select
                        value={documentType}
                        onChange={(event) => setDocumentType(event.target.value)}
                        className="rounded border p-2"
                        aria-label="Document type"
                      >
                        {DOCUMENT_TYPES.map((type) => <option key={type}>{type}</option>)}
                      </select>
                    ) : (
                      <input
                        value={requestField}
                        onChange={(event) => setRequestField(event.target.value)}
                        placeholder="Field (optional)"
                        className="rounded border p-2"
                        aria-label="Requested field"
                      />
                    )}
                  </div>
                  <LoadingButton
                    type="button"
                    onClick={handleRequestInformation}
                    disabled={working}
                    isLoading={workingAction === "request-information"}
                    loadingText="Sending request..."
                    className="rounded border border-blue-600 px-4 py-2 text-blue-700 disabled:opacity-50"
                  >
                    Send information request
                  </LoadingButton>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded border p-4">
                    <h3 className="font-semibold">Approve application</h3>
                    <label className="block text-sm font-medium">
                      Final class
                      <select
                        value={classId}
                        onChange={(event) => setClassId(event.target.value)}
                        aria-label="Final class"
                        disabled={working || classOptions.length === 0}
                        className="mt-1 w-full rounded border p-2 disabled:bg-gray-100"
                      >
                        <option value="">Select a class</option>
                        {classOptions.map((classroom) => (
                          <option key={classroom.id} value={classroom.id}>
                            {classroom.name}{classroom.level ? ` (${classroom.level})` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    {classOptionsError ? (
                      <p role="alert" className="text-sm text-red-700">{classOptionsError}</p>
                    ) : classOptions.length === 0 && (
                      <p className="text-sm text-amber-700">
                        No active classes are available for this application’s academic session.
                      </p>
                    )}
                    <LoadingButton
                      type="button"
                      onClick={() => {
                        if (!classOptions.some((classroom) => classroom.id === classId)) {
                          toast.error("Select a valid class for this academic session.");
                          return;
                        }
                        runAction("approve", { classId });
                      }}
                      disabled={working || classOptions.length === 0}
                      isLoading={workingAction === "approve"}
                      loadingText="Approving..."
                      className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                      Approve
                    </LoadingButton>
                  </div>
                  <div className="space-y-2 rounded border p-4">
                    <h3 className="font-semibold">Reject application</h3>
                    <textarea
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Reason for rejection"
                      rows={2}
                      className="w-full rounded border p-2"
                    />
                    <LoadingButton
                      type="button"
                      onClick={() => {
                        if (!reason.trim()) {
                          toast.error("Enter a rejection reason.");
                          return;
                        }
                        runAction("reject", { reason: reason.trim() });
                      }}
                      disabled={working}
                      isLoading={workingAction === "reject"}
                      loadingText="Rejecting..."
                      className="rounded bg-red-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                      Reject
                    </LoadingButton>
                  </div>
                </div>
              </>
            )}

            {currentStatus === "APPROVED" && (
              <LoadingButton
                type="button"
                onClick={() => runAction("enroll")}
                disabled={working}
                isLoading={workingAction === "enroll"}
                loadingText="Enrolling..."
                className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
              >
                Enroll applicant
              </LoadingButton>
            )}
          </div>}
          </div>
        </section>
      )}
    </main>
  );
}
