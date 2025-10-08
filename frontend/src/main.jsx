// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PlanProvider } from "./context/PlanContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <PlanProvider>
          <App />
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  </HelmetProvider>
);
