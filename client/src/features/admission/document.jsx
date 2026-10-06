import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDocument } from "./admissionSlice";
import FileInput from "../../components/inputs/fileInput"; // Adjust the import path as necessary

const MAX_FILE_SIZE_MB = 2;
const SCAN_TYPES = ".jpg,.jpeg,.png,.pdf";

// One place to describe each document: its label and which file types it accepts
const documentFields = {
  passport: { label: "Passport Photograph", fileType: "image" },
  birthCert: { label: "Birth Certificate", accept: SCAN_TYPES },
  schoolResult: { label: "Previous School Result / Testimonial", accept: SCAN_TYPES },
  medicalReport: { label: "Medical Report", accept: SCAN_TYPES },
  indigeneCert: { label: "Indigene Certificate (optional)", accept: SCAN_TYPES },
  transferCert: { label: "Transfer Certificate (if applicable)", accept: SCAN_TYPES },
};

const DocumentUpload = () => {
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const documents = useSelector((state) => state.admission.documents || {});

  const setFieldError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  // FileInput already checks file type and size, so by the time a file
  // reaches this handler it is valid. An empty selection means the file
  // was removed or rejected.
  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    setFieldError(field, null);
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);
    formData.append("field", field); // Optional metadata

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(uploadDocument({ field, file: { name: file.name, url: data.url } }));
      } else {
        setFieldError(field, data.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setFieldError(field, "Upload failed.");
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Upload Documents</h2>

      <div className="space-y-4">
        {Object.entries(documentFields).map(([field, { label, fileType, accept }]) => (
          <div key={field}>
            <FileInput
              label={label}
              name={field}
              fileType={fileType}
              accept={accept}
              maxSizeMB={MAX_FILE_SIZE_MB}
              error={errors[field]}
              onChange={(e) => handleFileChange(e, field)}
            />
            {documents[field] && (
              <span className="text-sm text-green-600">
                Uploaded: {documents[field].name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentUpload;