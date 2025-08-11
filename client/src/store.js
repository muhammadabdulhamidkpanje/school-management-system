import { configureStore } from "@reduxjs/toolkit";

import admissionReducer from "./features/admission/admissionSlice.js"
import addStaffReducer from "./features/addstaff/addstaffSlice.js";

const store = configureStore({
    reducer:{
        admission: admissionReducer,
        addStaff: addStaffReducer,

        
    }
})


export default store;