import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./index.css";

import AppRoutes from "./routes";
import store, { persistor } from "./store";
import queryClient from "./lib/queryClient";
import LoadingSpinner from "./UI/spinner";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Provider store={store}>
      {/* Wait for redux-persist to rehydrate so ProtectedRoute doesn't see a
          logged-out state on a hard refresh and bounce you to /auth/login. */}
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AppRoutes />
          <Toaster richColors closeButton position="top-right" />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </BrowserRouter>
);
