import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
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

  const openAdmission = async (id) => {
    setError("");
    try {
      const { data } = await api.get(`/admissions/${id}`);
      setSelected(getAdmission(data));
      setClassId("");
      setReason("");
      setRequestMessage("");
    } catch (requestError) {
      setError(getRequestError(requestError));
    }
  };

  const runAction = async (action, payload = {}) => {
    if (!selected?.id || working) return;
    setWorking(true);
    setError("");
    try {
      await api.post(`/admissions/${selected.id}/${action}`, payload);
      toast.success("Admission updated successfully.");
      await loadAdmissions();
      await openAdmission(selected.id);
    } catch (requestError) {
      const message = getRequestError(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setWorking(false);
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
          <button
            type="button"
            onClick={loadAdmissions}
            className="rounded border px-3 py-1 text-sm"
          >
            Refresh
          </button>
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
                      {[application.firstName, application.lastName].filter(Boolean).join(" ") ||
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
                      <button
                        type="button"
                        onClick={() => openAdmission(application.id)}
                        className="text-blue-700 underline"
                      >
                        Review
                      </button>
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
                {[selected.firstName, selected.middleName, selected.lastName]
                  .filter(Boolean)
                  .join(" ")}{" "}
                · {selected.email}
              </p>
            </div>
            <span className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
              {selected.status}
            </span>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Applicant information</h3>
              <dl className="mt-2 space-y-1 text-sm">
                {[
                  ["Date of birth", selected.dateOfBirth],
                  ["Gender", selected.gender],
                  ["Nationality", selected.nationality],
                  ["State of origin", selected.stateOfOrigin],
                  ["LGA", selected.lga],
                  ["Religion", selected.religion],
                  ["Academic session", selected.academicSessionId],
                  ["Requested class", selected.requestedClass?.name || selected.requestedClassId || selected.classId],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="font-medium">{label}:</dt>
                    <dd>{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
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
          </div>

          <div>
            <h3 className="font-semibold">Documents</h3>
            {Array.isArray(selected.documents) && selected.documents.length ? (
              <ul className="mt-2 flex flex-wrap gap-3 text-sm">
                {selected.documents.map((document, index) => (
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

          <div className="space-y-4 border-t pt-4">
            {canReview && (
              <button
                type="button"
                onClick={() => runAction("review")}
                disabled={working}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                Move to review
              </button>
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
                  <button
                    type="button"
                    onClick={handleRequestInformation}
                    disabled={working}
                    className="rounded border border-blue-600 px-4 py-2 text-blue-700 disabled:opacity-50"
                  >
                    Send information request
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded border p-4">
                    <h3 className="font-semibold">Approve application</h3>
                    <input
                      value={classId}
                      onChange={(event) => setClassId(event.target.value)}
                      placeholder="Final class ID"
                      aria-label="Final class ID"
                      className="w-full rounded border p-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!classId.trim()) {
                          toast.error("Enter the final class ID.");
                          return;
                        }
                        runAction("approve", { classId: classId.trim() });
                      }}
                      disabled={working}
                      className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                      Approve
                    </button>
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
                    <button
                      type="button"
                      onClick={() => {
                        if (!reason.trim()) {
                          toast.error("Enter a rejection reason.");
                          return;
                        }
                        runAction("reject", { reason: reason.trim() });
                      }}
                      disabled={working}
                      className="rounded bg-red-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </>
            )}

            {currentStatus === "APPROVED" && (
              <button
                type="button"
                onClick={() => runAction("enroll")}
                disabled={working}
                className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
              >
                Enroll applicant
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
