import React from "react";
import { useAuth } from "../context/AuthContext";

export default function AccountChip() {
  const { user, supabase } = useAuth();
  if (!user) return null;

  const logout = async () => { await supabase.auth.signOut(); };

  const email = user.email ?? "Account";
  return (
    <div className="flex items-center gap-3 bg-[#0f0e0c] border border-[#40434E]/40 px-3 py-2 rounded-lg">
      <span className="text-sm">{email}</span>
      <button onClick={logout} className="text-sm text-[#F3C77E] hover:underline">Sign out</button>
    </div>
  );
}
