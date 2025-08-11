import React from "react";
import { useState } from "react";
import ResultsSection from "../features/admission/result"; // Adjust the import path as necessary
import PersonalInfoForm from "../features/admission/personalInnfo"; // Adjust the import path as necessary
import DocumentUpload from "../features/admission/document"; 


export default function Admission(){
 const [step, setStep] = useState(1);

 const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
 const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

 return (
   <div className="min-h-screen bg-gray-100 p-4">
     <div className="max-w-3xl mx-auto">
       {step === 1 && <PersonalInfoForm />}
       {step === 2 && <ResultsSection />}
       {step === 3 && <DocumentUpload />}

       {/* Navigation Buttons */}
       <div className="flex justify-between mt-6">
         {step > 1 ? (
           <button
             onClick={handlePrev}
             className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
           >
             Previous
           </button>
         ) : (
           <div />
         )}

         {step < 3 ? (
           <button
             onClick={handleNext}
             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
           >
             Next
           </button>
         ) : (
           <button
             onClick={() => alert('Form submitted!')}
             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
           >
             Submit
           </button>
         )}
       </div>
     </div>
   </div>
 );
}




