import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/apiError";
import {
  updateAdmissionForm,
  selectAdmissionSession,
  updateRequiredResult,
  addExtraCourse,
  updateExtraCourse,
} from "./admissionSlice";

export default function ResultsSection() {
  const dispatch = useDispatch();
  const admission = useSelector((state) => state.admission || {});
  const {
    academicSessionId = "",
    classId = "",
    requiredAdmissionSubjects = ["English", "Mathematics"],
    requiredResults = {},
    english = "",
    math = "",
    extraCourses = [],
    serverErrors = {},
  } = admission;
  const [sessions, setSessions] = useState([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [classes, setClasses] = useState([]);
  const [classesSessionId, setClassesSessionId] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadSessions = async () => {
      setLoadingSessions(true);
      setSessionsLoaded(false);
      setOptionsError("");
      try {
        const { data } = await api.get("/admissions/options/sessions");
        if (!Array.isArray(data?.data)) {
          throw new Error("The admission sessions response was not valid.");
        }
        if (active) {
          setSessions(data.data);
          setSessionsLoaded(true);
        }
      } catch (error) {
        if (active) {
          setOptionsError(getErrorMessage(error, "Unable to load admission sessions."));
        }
      } finally {
        if (active) setLoadingSessions(false);
      }
    };

    loadSessions();
    return () => {
      active = false;
    };
  }, [refreshCount]);

  useEffect(() => {
    if (!sessionsLoaded) return;

    const selectedSession =
      sessions.find((session) => session.id === academicSessionId) ||
      sessions.find((session) => session.isCurrent) ||
      sessions[0];

    if (selectedSession && selectedSession.id !== academicSessionId) {
      dispatch(selectAdmissionSession({
        id: selectedSession.id,
        requiredAdmissionSubjects: selectedSession.requiredAdmissionSubjects,
      }));
    } else if (!selectedSession && academicSessionId) {
      dispatch(selectAdmissionSession({ id: "" }));
    }
  }, [academicSessionId, dispatch, sessions, sessionsLoaded]);

  useEffect(() => {
    let active = true;
    setClasses([]);
    setClassesSessionId("");

    if (!academicSessionId) {
      setLoadingClasses(false);
      return () => {
        active = false;
      };
    }

    const loadClasses = async () => {
      setLoadingClasses(true);
      setOptionsError("");
      try {
        const { data } = await api.get("/admissions/options/classes", {
          params: { academicSessionId },
        });
        if (!Array.isArray(data?.data)) {
          throw new Error("The admission classes response was not valid.");
        }
        if (active) {
          setClasses(data.data);
          setClassesSessionId(academicSessionId);
        }
      } catch (error) {
        if (active) {
          setOptionsError(getErrorMessage(error, "Unable to load classes for this session."));
        }
      } finally {
        if (active) setLoadingClasses(false);
      }
    };

    loadClasses();
    return () => {
      active = false;
    };
  }, [academicSessionId, refreshCount]);

  useEffect(() => {
    if (!academicSessionId || classesSessionId !== academicSessionId) return;

    const selectedClass =
      classes.find((item) => item.id === classId) || classes[0];
    if (selectedClass?.id !== classId) {
      dispatch(updateAdmissionForm({ classId: selectedClass?.id || "" }));
    }
  }, [academicSessionId, classId, classes, classesSessionId, dispatch]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateAdmissionForm({ [name]: value }));
  };

  const handleExtraCourseChange = (index, field, value) => {
    dispatch(updateExtraCourse({ index, field, value }));
  };

  const handleAddCourse = () => {
    dispatch(addExtraCourse());
  };

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Academic Information & Results</h2>
      <p className="mb-4 text-sm text-gray-600">
        Select an open admission session and an available class.
      </p>
      {(optionsError ||
        serverErrors.academicSessionId ||
        serverErrors.classId) && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          <p>
            {optionsError ||
              "The selected session or class was rejected. Refresh the options and select again."}
          </p>
          <button
            type="button"
            onClick={() => {
              dispatch(updateAdmissionForm({ academicSessionId: "", classId: "" }));
              setRefreshCount((count) => count + 1);
            }}
            className="mt-2 underline"
          >
            Refresh admission options
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Academic session
          <select
          name="academicSessionId"
          value={academicSessionId}
          onChange={(event) => {
            const session = sessions.find((item) => item.id === event.target.value);
            if (session) {
              dispatch(selectAdmissionSession({
                id: session.id,
                requiredAdmissionSubjects: session.requiredAdmissionSubjects,
              }));
            }
          }}
          aria-label="Academic session"
          required
          disabled={loadingSessions || sessions.length === 0}
          className="rounded border p-2"
          >
            <option value="">
              {loadingSessions ? "Loading sessions..." : "Select academic session"}
            </option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>{session.name}</option>
            ))}
          </select>
          {serverErrors.academicSessionId && (
            <span className="text-xs text-red-700" role="alert">
              {serverErrors.academicSessionId}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Class
          <select
          name="classId"
          value={classId}
          onChange={handleBasicChange}
          aria-label="Class"
          required
          disabled={!academicSessionId || loadingClasses || classes.length === 0}
          className="rounded border p-2"
          >
            <option value="">
              {!academicSessionId
                ? "Select a session first"
                : loadingClasses
                  ? "Loading classes..."
                  : "Select class"}
            </option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}{item.level ? ` (${item.level})` : ""}
              </option>
            ))}
          </select>
          {serverErrors.classId && (
            <span className="text-xs text-red-700" role="alert">
              {serverErrors.classId}
            </span>
          )}
        </label>
        <input
          type="text"
          name="english"
          value={english}
          onChange={handleBasicChange}
          placeholder="English Grade"
          aria-label="English grade"
          required
          className="rounded border p-2"
        />
        <input
          type="text"
          name="math"
          value={math}
          onChange={handleBasicChange}
          placeholder="Mathematics Grade"
          aria-label="Mathematics grade"
          required
          className="rounded border p-2"
        />
        {requiredAdmissionSubjects
          .filter((subject) => !["english", "mathematics", "math"].includes(subject.toLowerCase()))
          .map((subject) => (
            <label key={subject} className="flex flex-col gap-1 text-sm font-medium">
              {subject} Grade
              <input
                type="text"
                value={requiredResults[subject.toLowerCase()] || ""}
                onChange={(event) =>
                  dispatch(updateRequiredResult({ subject, grade: event.target.value }))
                }
                aria-label={`${subject} grade`}
                required
                className="rounded border p-2"
              />
            </label>
          ))}
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
              placeholder={`Subject ${index + 1}`}
              aria-label={`Subject ${index + 1}`}
              value={course.course}
              onChange={(e) =>
                handleExtraCourseChange(index, "course", e.target.value)
              }
              className="rounded border p-2"
            />
            <input
              type="text"
              placeholder="Grade"
              aria-label={`Grade for subject ${index + 1}`}
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
            type="button"
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