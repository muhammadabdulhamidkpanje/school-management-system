import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/apiError";
import FileInput from "../../components/inputs/fileInput";

const DOCUMENT_TYPES = [
  "PASSPORT",
  "BIRTH_CERTIFICATE",
  "SCHOOL_RESULT",
  "MEDICAL_REPORT",
  "INDIGENE_CERTIFICATE",
  "TRANSFER_CERTIFICATE",
];
const ACCEPTED_FILES =
  ".jpg,.jpeg,.png,.webp,.gif,.pdf,image/jpeg,image/png,image/webp,image/gif,application/pdf";

function unwrapList(data) {
  const value =
    data?.data?.informationRequests ??
    data?.data?.requests ??
    data?.data ??
    data?.informationRequests ??
    data?.requests;
  if (!Array.isArray(value)) {
    throw new Error("The information requests response was not valid.");
  }
  return value;
}

function unwrapAdmission(response) {
  const value =
    response?.data?.admission ??
    response?.data?.data?.admission ??
    response?.data?.data ??
    response?.data;
  if (!value || typeof value !== "object" || !value.status) {
    throw new Error("The application status response was not valid.");
  }
  return value;
}

function getRequestError(error) {
  return error instanceof Error && !error.isAxiosError
    ? error.message
    : getErrorMessage(error);
}

export default function AdmissionStatus() {
  const { id } = useParams();
  const [admission, setAdmission] = useState(null);
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState({});
  const [files, setFiles] = useState({});
  const [documentTypes, setDocumentTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statusResponse, requestResponse] = await Promise.all([
        api.get(`/admissions/${id}/status`),
        api.get(`/admissions/${id}/information-requests`),
      ]);
      setAdmission(unwrapAdmission(statusResponse));
      setRequests(unwrapList(requestResponse.data));
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRespond = async (request) => {
    const response = responses[request.id]?.trim();
    const file = files[request.id];
    if (!response && !file) {
      toast.error("Enter a response or attach the requested document.");
      return;
    }

    setSubmitting((current) => ({ ...current, [request.id]: true }));
    setError("");
    try {
      let document;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult = await api.post("/api/v1/uploads/admission", formData);
        const metadata = uploadResult.data?.data;
        if (!metadata?.publicId || !metadata.claimToken) {
          throw new Error("Upload response did not include the required file claim.");
        }
        document = {
          documentType:
            documentTypes[request.id] ||
            request.documentType ||
            "BIRTH_CERTIFICATE",
          fileName: metadata.fileName,
          fileUrl: metadata.fileUrl,
          mimeType: metadata.mimeType,
          fileSize: metadata.fileSize,
          publicId: metadata.publicId,
          resourceType: metadata.resourceType,
          claimToken: metadata.claimToken,
        };
      }

      await api.post(
        `/admissions/${id}/information-requests/${request.id}/respond`,
        {
          ...(response ? { response } : {}),
          ...(document ? { document } : {}),
        },
      );
      toast.success("Your response has been sent for review.");
      setResponses((current) => ({ ...current, [request.id]: "" }));
      setFiles((current) => ({ ...current, [request.id]: null }));
      setDocumentTypes((current) => {
        const next = { ...current };
        delete next[request.id];
        return next;
      });
      await refresh();
    } catch (requestError) {
      setError(
        getRequestError(requestError),
      );
    } finally {
      setSubmitting((current) => ({ ...current, [request.id]: false }));
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-3xl p-6">Loading application status...</main>;
  }

  if (error && !admission) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-3 text-2xl font-bold">Application status</h1>
        <p role="alert" className="text-red-700">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4">
      <section className="rounded bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Application status</h1>
        {admission && (
          <>
            <p className="mt-3">
              Application number:{" "}
              <strong>{admission.applicationNumber || admission.id || id}</strong>
            </p>
            <p className="mt-2">
              Status: <strong>{admission.status || "Unknown"}</strong>
            </p>
            {admission.createdAt && (
              <p className="mt-1 text-sm text-gray-600">
                Submitted: {new Date(admission.createdAt).toLocaleString()}
              </p>
            )}
          </>
        )}
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        <button
          type="button"
          onClick={refresh}
          className="mt-4 rounded border border-blue-600 px-4 py-2 text-blue-700"
        >
          Refresh status
        </button>
      </section>

      <section className="rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Information requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-600">There are no information requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const isOpen = ["OPEN", "open"].includes(request.status);
              return (
                <article key={request.id} className="rounded border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">
                      {request.documentType || request.field || request.type || "Request"}
                    </h3>
                    <span className="rounded bg-gray-100 px-2 py-1 text-sm">
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{request.message}</p>
                  {isOpen && (
                    <div className="mt-4 space-y-3">
                      <label className="block text-sm font-medium">
                        Your response
                        <textarea
                          value={responses[request.id] || ""}
                          onChange={(event) =>
                            setResponses((current) => ({
                              ...current,
                              [request.id]: event.target.value,
                            }))
                          }
                          rows={3}
                          className="mt-1 block w-full rounded border p-2"
                        />
                      </label>
                      <FileInput
                        label="Attach a document (optional)"
                        name={`response-${request.id}`}
                        accept={ACCEPTED_FILES}
                        maxSizeMB={20}
                        disabled={submitting[request.id]}
                        onChange={(event) =>
                          setFiles((current) => ({
                            ...current,
                            [request.id]: event.target.files?.[0] || null,
                          }))
                        }
                      />
                      {files[request.id] && (
                        <label className="block text-sm font-medium">
                          Document type
                          <select
                            value={
                              documentTypes[request.id] ||
                              request.documentType ||
                              "BIRTH_CERTIFICATE"
                            }
                            onChange={(event) =>
                              setDocumentTypes((current) => ({
                                ...current,
                                [request.id]: event.target.value,
                              }))
                            }
                            className="mt-1 block w-full rounded border p-2"
                          >
                            {DOCUMENT_TYPES.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRespond(request)}
                        disabled={submitting[request.id]}
                        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                      >
                        {submitting[request.id] ? "Sending..." : "Send response"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
      <Link to="/admission" className="inline-block text-blue-700 underline">
        Start a new application
      </Link>
    </main>
  );
}
