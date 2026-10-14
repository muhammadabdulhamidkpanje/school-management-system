import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/apiError";

const createInitialState = () => ({
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  stateOfOrigin: "",
  lga: "",
  religion: "",
  academicSessionId: "",
  classId: "",
  requiredAdmissionSubjects: ["English", "Mathematics"],
  requiredResults: {},
  english: "",
  math: "",
  extraCourses: [],
  documents: {},
  additionalDocuments: [],
  uploadingDocuments: {},
  status: "idle",
  error: null,
  serverErrors: {},
  submission: null,
});

export const submitAdmission = createAsyncThunk(
  "admission/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admissions", payload);
      const submission = data.data;
      if (submission?.id && submission?.applicantToken) {
        try {
          localStorage.setItem(`admissionToken:${submission.id}`, submission.applicantToken);
        } catch {
          // storage unavailable; applicant can still see the success screen
        }
      }
      return submission;
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error),
        errors: error?.response?.data?.errors || {},
      });
    }
  },
);

const admissionSlice = createSlice({
  name: "admission",
  initialState: createInitialState(),
  reducers: {
    updateAdmissionForm: (state, action) => {
      Object.assign(state, action.payload);
      state.serverErrors = {};
    },
    selectAdmissionSession: (state, action) => {
      const { id, requiredAdmissionSubjects } = action.payload;
      state.academicSessionId = id;
      state.classId = "";
      state.requiredAdmissionSubjects = Array.isArray(requiredAdmissionSubjects)
        ? requiredAdmissionSubjects
        : ["English", "Mathematics"];
      state.requiredResults = {};
      state.serverErrors = {};
    },
    updateRequiredResult: (state, action) => {
      const { subject, grade } = action.payload;
      state.requiredResults[subject.toLowerCase()] = grade;
      state.serverErrors = {};
    },
    addExtraCourse: (state) => {
      if (state.extraCourses.length < 5) {
        state.extraCourses.push({ course: "", grade: "" });
      }
    },
    updateExtraCourse: (state, action) => {
      const { index, field, value } = action.payload;
      if (state.extraCourses[index]) {
        state.extraCourses[index][field] = value;
      }
    },
    uploadDocument: (state, action) => {
      const { field, document } = action.payload;
      state.documents ??= {};
      state.documents[field] = document;
    },
    addAdditionalDocument: (state, action) => {
      if (state.additionalDocuments.length < 16) {
        state.additionalDocuments.push({
          id: action.payload,
          documentType: "",
        });
      }
    },
    updateAdditionalDocumentType: (state, action) => {
      const { id, documentType } = action.payload;
      const entry = state.additionalDocuments.find((item) => item.id === id);
      if (entry) {
        entry.documentType = documentType;
        const document = state.documents[`additional:${id}`];
        if (document) document.documentType = documentType;
      }
      state.serverErrors = {};
    },
    removeAdditionalDocument: (state, action) => {
      state.additionalDocuments = state.additionalDocuments.filter(
        (item) => item.id !== action.payload,
      );
      if (state.documents) delete state.documents[`additional:${action.payload}`];
      if (state.uploadingDocuments) {
        delete state.uploadingDocuments[`additional:${action.payload}`];
      }
    },
    setDocumentUploading: (state, action) => {
      const { field, uploading } = action.payload;
      state.uploadingDocuments ??= {};
      state.uploadingDocuments[field] = uploading;
    },
    clearDocument: (state, action) => {
      if (state.documents) {
        delete state.documents[action.payload];
      }
    },
    resetAdmission: () => createInitialState(),
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAdmission.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.serverErrors = {};
      })
      .addCase(submitAdmission.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.submission = action.payload;
      })
      .addCase(submitAdmission.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
        state.serverErrors = action.payload?.errors || {};
      });
  },
});

export const {
  updateAdmissionForm,
  selectAdmissionSession,
  updateRequiredResult,
  addExtraCourse,
  updateExtraCourse,
  uploadDocument,
  addAdditionalDocument,
  updateAdditionalDocumentType,
  removeAdditionalDocument,
  setDocumentUploading,
  clearDocument,
  resetAdmission,
} = admissionSlice.actions;

export default admissionSlice.reducer;