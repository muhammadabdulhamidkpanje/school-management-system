import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import admissionReducer from "./features/admission/admissionSlice.js";
import addStaffReducer from "./features/addstaff/addstaffSlice.js";
import authReducer from "./features/auth/authSlice.js";

const rootReducer = combineReducers({
  admission: admissionReducer,
  addStaff: addStaffReducer,
  auth: authReducer
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


export const persistor = persistStore(store);
export default store;