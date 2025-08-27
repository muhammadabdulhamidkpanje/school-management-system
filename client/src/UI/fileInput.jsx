import React, { useState, useRef } from "react";

export default function FileInput({ onFileSelect, multiple = false }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    setFiles(fileArray);

    if (onFileSelect) {
      onFileSelect(fileArray); // send to parent
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      {/* Dropzone */}
      <div
        className={`rounded-xl border-2 border-dashed p-6 text-center transition ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"} `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleChange}
          className="hidden"
          multiple={multiple}
        />

        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-12 w-12 rounded border object-cover"
                  />
                ) : (
                  <span className="text-gray-600">📄</span>
                )}
                <p className="text-sm text-gray-700">{file.name}</p>
              </div>
            ))}
            <p className="text-sm text-gray-500">Click or drag to replace</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">Drag & drop file(s) here</p>
            <p className="text-sm text-gray-500">or click to select</p>
          </div>
        )}
      </div>
    </div>
  );
}
