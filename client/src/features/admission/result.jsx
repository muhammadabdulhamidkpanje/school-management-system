import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateResults,
  addExtraCourse,
  updateExtraCourse,
} from "./admissionSlice"; // Adjust the import path as necessary

export default function ResultsSection() {
  const dispatch = useDispatch();
  const { regNumber, english, math, extraCourses } = useSelector(
    (state) => state.admission.results
  );

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateResults({ [name]: value }));
  };

  const handleExtraCourseChange = (index, field, value) => {
    dispatch(updateExtraCourse({ index, field, value }));
  };

  const handleAddCourse = () => {
    dispatch(addExtraCourse());
  };

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Academic Results</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          type="text"
          name="regNumber"
          value={regNumber}
          onChange={handleBasicChange}
          placeholder="Registration Number"
          className="rounded border p-2"
        />
        <input
          type="text"
          name="english"
          value={english}
          onChange={handleBasicChange}
          placeholder="English Grade"
          className="rounded border p-2"
        />
        <input
          type="text"
          name="math"
          value={math}
          onChange={handleBasicChange}
          placeholder="Mathematics Grade"
          className="rounded border p-2"
        />
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-lg font-semibold">Other Courses</h3>
        {extraCourses.map((course, index) => (
          <div
            key={index}
            className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <input
              type="text"
              placeholder={`Course ${index + 1} Name`}
              value={course.course}
              onChange={(e) =>
                handleExtraCourseChange(index, "course", e.target.value)
              }
              className="rounded border p-2"
            />
            <input
              type="text"
              placeholder={`Grade`}
              value={course.grade}
              onChange={(e) =>
                handleExtraCourseChange(index, "grade", e.target.value)
              }
              className="rounded border p-2"
            />
          </div>
        ))}

        {extraCourses.length < 5 && (
          <button
            onClick={handleAddCourse}
            className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add Course
          </button>
        )}
      </div>
    </div>
  );
}
