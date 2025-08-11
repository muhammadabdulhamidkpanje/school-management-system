import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  staffBioData: {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  },
  staffAcademics: [],
  staffDepartment: {
    department: '',
    faculty: '',
    position: '',
    employmentType: '',
    employmentDate: '',
    document: null,
  },
  staffAccount: {
    bankName: "",
    accountNumber: "",
    bvn: "",
  },
    staffLogin: {
        email: "",
        password: "",
        confirmPassword: "",
    },
};

const staffSlice = createSlice({
  name: "addStaff",
  initialState,
  reducers: {
    handleSetBioData: (state, action) => {
      state.staffBioData = {
        ...state.staffBioData,
        ...action.payload,
      };
    },
    handleSetAcademics: (state, action) => {
      state.staffAcademics = action.payload;
    },
    handleSetDepartment: (state, action) => {
      state.staffDepartment = {
        ...state.staffDepartment,
        ...action.payload,
      };
    },
    handleSetAccount: (state, action) => {
      state.staffAccount = {
        ...state.staffAccount,
        ...action.payload,
      };
    },
    handleSetLogin: (state, action) => {
        state.staffLogin = {
            ...state.staffLogin,
            ...action.payload,
        }
    }
  },
});

export const { handleSetBioData, handleSetAcademics, handleSetDepartment, handleSetAccount, handleSetLogin } =
  staffSlice.actions;

export default staffSlice.reducer;
