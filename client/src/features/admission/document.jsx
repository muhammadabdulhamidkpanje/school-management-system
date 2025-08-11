import React, { useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { uploadDocument } from "./admissionSlice"; // Adjust the import path as necessary
//import { ALLOWED_TYPES, MAX_FILE_SIZE_MB } from "./constants";


const fileLabels = {
  passport: "Passport Photograph",
  birthCert: "Birth Certificate",
  schoolResult: "Previous School Result / Testimonial",
  medicalReport: "Medical Report",
  indigeneCert: "Indigene Certificate (optional)",
  transferCert: "Transfer Certificate (if applicable)",
};

const DocumentUpload = () => {
  const [previews, setPreviews] = useState({});
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const fileLabels = {
  passport: 'Passport Photograph',
  birthCert: 'Birth Certificate',
  schoolResult: 'Previous School Result / Testimonial',
  medicalReport: 'Medical Report',
  indigeneCert: 'Indigene Certificate (optional)',
  transferCert: 'Transfer Certificate (if applicable)',
};

const documents = useSelector((state) => state.admission.documents || {});


  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Invalid file type (jpg, png, pdf allowed).",
      }));
      return;
    }

    // ✅ Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [field]: "File is too large (max 2MB).",
      }));
      return;
    }

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

        if (file.type.startsWith("image/")) {
          setPreviews((prev) => ({
            ...prev,
            [field]: URL.createObjectURL(file),
          }));
        } else {
          setPreviews((prev) => ({ ...prev, [field]: file.name }));
        }

        setErrors((prev) => ({ ...prev, [field]: null }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [field]: data.error || "Upload failed.",
        }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, [field]: "Upload failed." }));
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Upload Documents</h2>

      <div className="space-y-4">
        {Object.entries(fileLabels).map(([field, label]) => (
          <div key={field} className="flex flex-col">
            <label className="mb-1 font-medium">{label}</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileChange(e, field)}
              className="rounded border p-2"
            />
            {documents[field] && (
              <span className="mt-1 text-sm text-green-600">
                File selected: {documents[field].name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentUpload;
