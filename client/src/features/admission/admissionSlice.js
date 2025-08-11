import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  personalInfo: {
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    stateOfOrigin: "",
    lga: "",
    religion: "",
  },
  results: {
    regNumber: "",
    english: "",
    math: "",
    extraCourses: [], // { course: '', grade: '' }
  },
  documents: {
    passport: null,
    birthCert: null,
    schoolResult: null,
    medicalReport: null,
    indigeneCert: null,
    transferCert: null,
  },
};

const admissionSlice = createSlice({
  name: "admission",
  initialState,
  reducers: {
    updatePersonalInfo: (state, action) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    updateResults: (state, action) => {
      state.results = { ...state.results, ...action.payload };
    },
    addExtraCourse: (state) => {
      if (state.results.extraCourses.length < 5) {
        state.results.extraCourses.push({ course: "", grade: "" });
      }
    },
    updateExtraCourse: (state, action) => {
      const { index, field, value } = action.payload;
      state.results.extraCourses[index][field] = value;
    },
    uploadDocument: (state, action) => {
        const { field, file } = action.payload;
        state.documents[field] = file;
    }
  },
});

export const {
  updatePersonalInfo,
  updateResults,
  addExtraCourse,
  updateExtraCourse,
  uploadDocument,
} = admissionSlice.actions;
export default admissionSlice.reducer;
