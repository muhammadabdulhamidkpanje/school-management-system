import React, { useEffect, useId, useMemo, useRef, useState } from "react";

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Mirrors the native `accept` attribute: ".pdf", "image/*", "image/png"
const matchesAccept = (file, accept) => {
  if (!accept) return true;
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
      if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
      return file.type === rule;
    });
};

// Friendly presets for the `fileType` prop
const FILE_TYPES = {
  image: { accept: "image/*", label: "Images" },
  pdf: { accept: ".pdf,application/pdf", label: "PDF" },
  document: { accept: ".pdf,.doc,.docx,.txt", label: "PDF, DOC, DOCX, TXT" },
  spreadsheet: { accept: ".xls,.xlsx,.csv", label: "XLS, XLSX, CSV" },
  video: { accept: "video/*", label: "Videos" },
  audio: { accept: "audio/*", label: "Audio" },
};

export default function FileInput({
  label,
  name,
  onChange,
  fileType, // "image" | "pdf" | "document" | "spreadsheet" | "video" | "audio"
  accept: acceptProp, // raw override, e.g. ".png,.jpg" (wins over fileType)
  multiple = false,
  maxSizeMB,
  helperText,
  error,
  disabled = false,
}) {
  const autoId = useId();
  const id = name || autoId;
  const preset = FILE_TYPES[fileType];
  const accept = acceptProp ?? preset?.accept;
  const acceptHint = acceptProp
    ? acceptProp.split(",").map((s) => s.trim()).join(", ")
    : preset?.label;
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const message = error || localError;
  const describedBy = message ? `${id}-error` : helperText ? `${id}-help` : undefined;

  // Image thumbnails, cleaned up when the selection changes
  const previews = useMemo(
    () => files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)),
    [files]
  );
  useEffect(() => () => previews.forEach((url) => url && URL.revokeObjectURL(url)), [previews]);

  // Every path (browse, drop, remove) ends up here via the native change event,
  // so the parent's onChange keeps receiving a normal event with e.target.files.
  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    const maxBytes = maxSizeMB ? maxSizeMB * 1024 * 1024 : Infinity;

    const wrongType = picked.find((f) => !matchesAccept(f, accept));
    const tooBig = picked.find((f) => f.size > maxBytes);

    if (wrongType || tooBig) {
      setLocalError(
        wrongType
          ? `${wrongType.name} is not an accepted file type.`
          : `${tooBig.name} is larger than ${maxSizeMB} MB.`
      );
      e.target.value = "";
      setFiles([]);
    } else {
      setLocalError("");
      setFiles(picked);
    }
    onChange?.(e);
  };

  const applyFiles = (list) => {
    const input = inputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) applyFiles(multiple ? dropped : dropped.slice(0, 1));
  };

  const removeFile = (index) => applyFiles(files.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col mb-2">
      {label && (
        <label htmlFor={id} className="mb-2 text-sm font-bold text-blue-500 uppercase">
          {label}
        </label>
      )}

      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-blue-500",
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
            : "cursor-pointer text-gray-600 hover:border-blue-400 hover:bg-blue-50",
          dragging ? "border-blue-500 bg-blue-50" : message ? "border-red-400" : "border-gray-300",
        ].join(" ")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-8 w-8 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 16V4m0 0L8 8m4-4 4 4" />
          <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        <span className="text-sm">
          <span className="font-semibold text-blue-600">Choose {multiple ? "files" : "a file"}</span>{" "}
          or drag {multiple ? "them" : "it"} here
        </span>
        {(acceptHint || maxSizeMB) && (
          <span className="text-xs text-gray-400">
            {acceptHint}
            {acceptHint && maxSizeMB ? " – " : ""}
            {maxSizeMB ? `up to ${maxSizeMB} MB` : ""}
          </span>
        )}

        <input
          ref={inputRef}
          id={id}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          aria-invalid={message ? true : undefined}
          aria-describedby={describedBy}
          className="sr-only"
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-2 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${file.lastModified}`}
              className="flex items-center gap-3 rounded-md border border-gray-200 p-2"
            >
              {previews[i] ? (
                <img src={previews[i]} alt="" className="h-10 w-10 rounded object-cover" />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-500"
                >
                  {file.name.split(".").pop()?.slice(0, 4).toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-gray-800">{file.name}</span>
                <span className="block text-xs text-gray-500">{formatSize(file.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${file.name}`}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {message ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-red-600">
          {message}
        </p>
      ) : (
        helperText && (
          <p id={`${id}-help`} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}