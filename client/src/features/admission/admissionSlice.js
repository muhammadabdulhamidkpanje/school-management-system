import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for submission
// export const submitAdmission = createAsyncThunk(
//   "admission/submitAdmission",
//   async (admissionData, thunkAPI) => {
//     try {
//       const response = await fetch("http://localhost:3000/api/v1/admissions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(admissionData),
//       });
//       return await response.json();
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.message);
//     }
//   },
// );

const initialState = {
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    stateOfOrigin: "",
    lga: "",
    religion: "",
    email: "",
    regNumber: "",
    english: "",
    math: "",
    extraCourses: [], // { course: '', grade: '' }
    passport: null,
    birthCert: null,
    schoolResult: null,
    medicalReport: null,
    indigeneCert: null,
    transferCert: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const admissionSlice = createSlice({
  name: "admission",
  initialState,
  reducers: {
    updateAdmissionForm: (state, action) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    addExtraCourse: (state) => {
      if (state.extraCourses.length < 5) {
        state.extraCourses.push({ course: "", grade: "" });
      }
    },
    updateExtraCourse: (state, action) => {
      const { index, field, value } = action.payload;
      state.extraCourses[index][field] = value;
    },
    uploadDocument: (state, action) => {
      const { field, file } = action.payload;
      state.documents[field] = file;
    },
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(submitAdmission.pending, (state) => {
  //       state.status = "loading";
  //     })
  //     .addCase(submitAdmission.fulfilled, (state, action) => {
  //       state.status = "succeeded";
  //       console.log("Success:", action.payload);
  //     })
  //     .addCase(submitAdmission.rejected, (state, action) => {
  //       state.status = "failed";
  //       state.error = action.payload;
  //       console.error("Error:", action.payload);
  //     });
  // },
});

export const {
  updateAdmissionForm,
  addExtraCourse,
  updateExtraCourse,
  uploadDocument,
} = admissionSlice.actions;

export default admissionSlice.reducer;
