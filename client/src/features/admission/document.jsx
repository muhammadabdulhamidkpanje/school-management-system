import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/apiError";
import FileInput from "../../components/inputs/fileInput";
import {
  addAdditionalDocument,
  clearDocument,
  removeAdditionalDocument,
  setDocumentUploading,
  updateAdditionalDocumentType,
  uploadDocument,
} from "./admissionSlice";

const MAX_FILE_SIZE_MB = 20;
const ACCEPTED_FILES =
  ".jpg,.jpeg,.png,.webp,.gif,.pdf,image/jpeg,image/png,image/webp,image/gif,application/pdf";

const documentFields = {
  passport: { label: "Passport Photograph", documentType: "PASSPORT", required: true },
  birthCert: { label: "Birth Certificate", documentType: "BIRTH_CERTIFICATE", required: true },
  schoolResult: { label: "Previous School Result", documentType: "SCHOOL_RESULT", required: true },
  medicalReport: { label: "Medical Report", documentType: "MEDICAL_REPORT", required: true },
  indigeneCert: {
    label: "Indigene Certificate (optional)",
    documentType: "INDIGENE_CERTIFICATE",
    required: false,
  },
  transferCert: {
    label: "Transfer Certificate (optional)",
    documentType: "TRANSFER_CERTIFICATE",
    required: false,
  },
};

export default function DocumentUpload() {
  const dispatch = useDispatch();
  const { documents = {}, additionalDocuments = [] } = useSelector(
    (state) => state.admission,
  );
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState({});

  const isUniqueDocumentType = (documentType, currentId) => {
    const normalizedType = documentType.trim().toUpperCase();
    return (
      !Object.values(documentFields).some(
        (config) => config.documentType === normalizedType,
      ) &&
      additionalDocuments.every(
        (item) =>
          item.id === currentId ||
          item.documentType.trim().toUpperCase() !== normalizedType,
      )
    );
  };

  const handleFileChange = async (event, field, documentType) => {
    const file = event.target.files?.[0];
    const resolvedDocumentType =
      documentFields[field]?.documentType || documentType || "";
    setErrors((current) => ({ ...current, [field]: "" }));

    if (!file) {
      dispatch(clearDocument(field));
      return;
    }

    if (
      !/^[A-Z0-9_]+$/.test(resolvedDocumentType) ||
      (field.startsWith("additional:") &&
        !isUniqueDocumentType(
          resolvedDocumentType,
          field.slice("additional:".length),
        ))
    ) {
      setErrors((current) => ({
        ...current,
        [field]: "Enter a unique document type using uppercase letters, numbers, and underscores.",
      }));
      return;
    }

    dispatch(clearDocument(field));
    dispatch(setDocumentUploading({ field, uploading: true }));
    setUploading((current) => ({ ...current, [field]: true }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/api/v1/uploads/admission", formData);
      if (!data?.data?.publicId || !data.data.claimToken) {
        throw new Error("Upload response did not include the required file claim.");
      }
      dispatch(
        uploadDocument({
          field,
          document: {
            ...data.data,
            documentType: resolvedDocumentType,
          },
        }),
      );
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [field]: error instanceof Error && !error.isAxiosError
          ? error.message
          : getErrorMessage(error, "Unable to upload this file. Please try again."),
      }));
    } finally {
      dispatch(setDocumentUploading({ field, uploading: false }));
      setUploading((current) => ({ ...current, [field]: false }));
    }
  };

  return (
    <section className="mx-auto mt-6 max-w-2xl rounded bg-white p-6 shadow-md">
      <h2 className="mb-2 text-xl font-bold">Required Documents</h2>
      <p className="mb-4 text-sm text-gray-600">
        Accepted formats: JPEG, PNG, WEBP, GIF, and PDF. Maximum size: 20 MB per file.
      </p>
      <div className="space-y-4">
        {Object.entries(documentFields).map(([field, config]) => (
          <div key={field}>
            <FileInput
              label={`${config.label}${config.required ? " *" : ""}`}
              name={field}
              accept={ACCEPTED_FILES}
              maxSizeMB={MAX_FILE_SIZE_MB}
              disabled={uploading[field]}
              error={errors[field]}
              onChange={(event) => handleFileChange(event, field)}
            />
            {uploading[field] && (
              <p className="text-sm text-blue-700" role="status">Uploading...</p>
            )}
            {!uploading[field] && documents[field] && (
              <p className="text-sm text-green-700" role="status">
                Uploaded: {documents[field].fileName}
              </p>
            )}
          </div>
        ))}
        {additionalDocuments.map((item, index) => {
          const field = `additional:${item.id}`;
          const typeIsValid =
            /^[A-Z0-9_]+$/.test(item.documentType.trim()) &&
            isUniqueDocumentType(item.documentType, item.id);

          return (
            <div key={item.id} className="rounded border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label
                  htmlFor={`document-type-${item.id}`}
                  className="text-sm font-semibold"
                >
                  Additional document type {index + 1}
                </label>
                <button
                  type="button"
                  disabled={uploading[field]}
                  onClick={() => {
                    dispatch(clearDocument(field));
                    dispatch(removeAdditionalDocument(item.id));
                  }}
                  className="text-sm text-red-700 underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
              <input
                id={`document-type-${item.id}`}
                type="text"
                value={item.documentType}
                placeholder="e.g. TRANSFER_CERTIFICATE"
                aria-label={`Additional document type ${index + 1}`}
                onChange={(event) => {
                  const documentType = event.target.value.toUpperCase();
                  dispatch(updateAdditionalDocumentType({ id: item.id, documentType }));
                  setErrors((current) => ({ ...current, [field]: "" }));
                }}
                className="mb-3 w-full rounded border p-2"
              />
              <FileInput
                label={`Upload ${item.documentType || "additional document"} *`}
                name={`additional-document-${item.id}`}
                accept={ACCEPTED_FILES}
                maxSizeMB={MAX_FILE_SIZE_MB}
                disabled={uploading[field] || !typeIsValid}
                error={errors[field]}
                helperText="Use a unique uppercase type, such as TRANSFER_CERTIFICATE."
                onChange={(event) =>
                  handleFileChange(event, field, item.documentType)
                }
              />
              {uploading[field] && (
                <p className="text-sm text-blue-700" role="status">Uploading...</p>
              )}
              {!uploading[field] && documents[field] && (
                <p className="text-sm text-green-700" role="status">
                  Uploaded: {documents[field].fileName}
                </p>
              )}
              {!typeIsValid && item.documentType && (
                <p className="text-sm text-red-700" role="alert">
                  Document type must be unique and use uppercase letters, numbers, and underscores.
                </p>
              )}
            </div>
          );
        })}
      </div>
      {additionalDocuments.length < 16 && (
        <button
          type="button"
          onClick={() => dispatch(addAdditionalDocument(crypto.randomUUID()))}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add document
        </button>
      )}
    </section>
  );
}
