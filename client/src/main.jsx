import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, } from "react-router";
import {Provider} from "react-redux";
import "./index.css";

import AppRoutes from "./routes";
import store from "./store";


const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
  <Provider store={store}> 
    <AppRoutes />
  </Provider>
  </BrowserRouter>
);
