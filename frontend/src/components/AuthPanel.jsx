import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPanel() {
  const { supabase } = useAuth();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleEmailPassword = async (mode) => {
    setLoading(true); setMsg("");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg("Signed in. Redirecting…");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Check your inbox to confirm your account.");
      }
    } catch (e) {
      setMsg(e.message);
    } finally { setLoading(false); }
  };

  const handleMagicLink = async () => {
    setLoading(true); setMsg("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true }});
      if (error) throw error;
      setMsg("Magic link sent! Check your email.");
    } catch (e) {
      setMsg(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md w-full p-6 rounded-xl border border-[#40434E]/40 bg-[#080705]">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("signin")}
          className={`px-4 py-2 rounded-lg ${tab==="signin" ? "bg-[#702632] text-white" : "bg-transparent border border-[#40434E]/40"}`}
        >Sign in</button>
        <button
          onClick={() => setTab("signup")}
          className={`px-4 py-2 rounded-lg ${tab==="signup" ? "bg-[#702632] text-white" : "bg-transparent border border-[#40434E]/40"}`}
        >Create account</button>
      </div>

      <label className="block text-sm mb-1 text-[#d6d6d6]">Email</label>
      <input
        type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-lg bg-[#0f0e0c] border border-[#40434E]/40 text-white"
        placeholder="you@restaurant.com"
      />

      {tab === "signin" && (
        <>
          <label className="block text-sm mb-1 text-[#d6d6d6]">Password</label>
          <input
            type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-lg bg-[#0f0e0c] border border-[#40434E]/40 text-white"
            placeholder="••••••••"
          />
        </>
      )}
      {tab === "signup" && (
        <>
          <label className="block text-sm mb-1 text-[#d6d6d6]">Password</label>
          <input
            type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-lg bg-[#0f0e0c] border border-[#40434E]/40 text-white"
            placeholder="Min 6 characters"
          />
        </>
      )}

      <div className="flex gap-3">
        {tab === "signin" ? (
          <button
            onClick={()=>handleEmailPassword("signin")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#702632] hover:bg-[#912F40] disabled:opacity-60"
          >{loading ? "Signing in…" : "Sign in"}</button>
        ) : (
          <button
            onClick={()=>handleEmailPassword("signup")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#702632] hover:bg-[#912F40] disabled:opacity-60"
          >{loading ? "Creating…" : "Create account"}</button>
        )}

        <button
          onClick={handleMagicLink}
          disabled={loading || !email}
          className="px-4 py-2 rounded-lg border border-[#F3C77E] text-[#F3C77E] hover:bg-[#F3C77E] hover:text-[#080705] disabled:opacity-60"
        >Send magic link</button>
      </div>

      {msg && <p className="mt-4 text-sm text-[#d6d6d6]">{msg}</p>}
    </div>
  );
}
