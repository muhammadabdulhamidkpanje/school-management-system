import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ResultsSection from "../features/admission/result"; // Adjust the import path as necessary
import PersonalInfoForm from "../features/admission/personalInnfo"; // Adjust the import path as necessary
import DocumentUpload from "../features/admission/document";

//import { submitAdmission } from "../features/admission/admissionSlice";

export default function Admission() {
  const dispatch = useDispatch();
  const admission = useSelector((state) => state.admission);
  const [step, setStep] = useState(1);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    const admissionData = {
      personalInfo: admission,
      // results: admission.results,
      // documents: admission.documents,
    };
    console.log(admissionData)
    try {
    const response = await fetch("http://localhost:3000/api/v1/admissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(admissionData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error submitting admission:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-3xl">
        {step === 1 && <PersonalInfoForm />}
        {step === 2 && <ResultsSection />}
        {step === 3 && <DocumentUpload />}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => handleSubmit()}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
