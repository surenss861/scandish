import React from "react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, fallback }) {
  const { user, sessionLoaded } = useAuth();
  if (!sessionLoaded) return null; // or a loader
  return user ? children : (fallback ?? null);
}
