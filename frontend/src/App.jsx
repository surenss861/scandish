// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import NewDashboard from "./pages/NewDashboard.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import Help from "./pages/Help.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import MultiLocationPage from "./pages/MultiLocationPage.jsx";
import BrandingPage from "./pages/BrandingPage.jsx";

// Branding sub-pages
import BrandingLayout from "./pages/branding/BrandingLayout.jsx";
import LogoPage from "./pages/branding/LogoPage.jsx";
import ColorsPage from "./pages/branding/ColorsPage.jsx";
import TypographyPage from "./pages/branding/TypographyPage.jsx";
import LayoutPage from "./pages/branding/LayoutPage.jsx";
import CustomPage from "./pages/branding/CustomPage.jsx";
import MenuBrandingPage from "./pages/branding/MenuPage.jsx";
import TemplatesPage from "./pages/TemplatesPage.jsx";
import AdvancedPage from "./pages/branding/AdvancedPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<NewDashboard />} />
      <Route path="/menu/:slug" element={<MenuPage />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/help" element={<Help />} />
      <Route path="/admin" element={<AdminPanel />} />

      {/* Feature Pages */}
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/locations" element={<MultiLocationPage />} />

      {/* Branding with nested routes */}
      <Route path="/branding" element={<BrandingLayout />}>
        <Route index element={<Navigate to="/branding/logo" replace />} />
        <Route path="logo" element={<LogoPage />} />
        <Route path="colors" element={<ColorsPage />} />
        <Route path="typography" element={<TypographyPage />} />
        <Route path="layout" element={<LayoutPage />} />
        <Route path="custom" element={<CustomPage />} />
        <Route path="menu" element={<MenuBrandingPage />} />
        <Route path="advanced" element={<AdvancedPage />} />
      </Route>
      <Route path="/templates" element={<TemplatesPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
