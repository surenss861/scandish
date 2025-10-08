// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // read ?next=/somewhere (default to /dashboard)
  const params = new URLSearchParams(location.search);
  const next = params.get("next") || "/dashboard";

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Login — QuickMenu";
    return () => (document.title = prev);
  }, []);

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "QuickMenu",
      url: "https://quickmenu.app/login",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://quickmenu.app/search?q={query}",
        "query-input": "required name=query",
      },
    }),
    []
  );

  useEffect(() => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.text = JSON.stringify(jsonLd);
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, [jsonLd]);

  const handleAuth = async () => {
    setLoading(true);
    setMsg("");
    try {
      if (!email) throw new Error("Email is required");
      if (mode !== "signin" && password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg("Signed in. Redirecting…");
        navigate(next, { replace: true }); // redirect AFTER successful sign-in
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + next
          }
        });
        if (error) throw error;
        setMsg("Account created! Signing you in...");
        // Auto sign in after successful signup
        setTimeout(async () => {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError) {
            navigate(next, { replace: true });
          }
        }, 1000);
      }
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setMsg("");
    try {
      if (!email) throw new Error("Enter your email first");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset",
      });
      if (error) throw error;
      setMsg("Password reset link sent.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + next },
      });
      if (error) throw error;
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080705] text-[#FFFFFA]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 scanlines-move" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_10%,rgba(255,255,255,0.06),transparent_60%)]"
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <header className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="text-2xl font-bold text-[#F3C77E]">QuickMenu</span>
            <span className="text-sm text-[#d6d6d6] group-hover:text-[#F3C77E] transition-colors">Home</span>
          </Link>
        </header>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="fade-in-bottom">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Sign in to <span className="text-[#F3C77E]">manage your menus</span>
            </h1>
            <p className="text-[#d6d6d6] text-lg">
              Access your dashboard, edit items, update prices, and publish changes instantly.
            </p>
            <div className="mt-10 inline-flex items-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-[#702632] opacity-20 animate-pulseQR" />
                <div className="relative z-10 bg-white p-2 rounded-lg shadow-lg">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=QuickMenu"
                    alt="QuickMenu QR Code"
                    className="w-[88px] h-[88px]"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="ml-4 text-sm text-[#d6d6d6]">
                One QR. Infinite updates. <br /> No PDFs. No reprints.
              </div>
            </div>
          </div>

          <div className="fade-in-bottom-delay">
            {!user ? (
              <div className="p-6 rounded-xl border border-[#40434E]/40 bg-[#0f0e0c]">
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setMode("signin")}
                    className={`px-4 py-2 rounded-lg ${mode === "signin" ? "bg-[#702632] text-white" : "bg-transparent border border-[#40434E]/40"
                      }`}
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className={`px-4 py-2 rounded-lg ${mode === "signup" ? "bg-[#702632] text-white" : "bg-transparent border border-[#40434E]/40"
                      }`}
                  >
                    Create account
                  </button>
                </div>

                <label className="block text-sm mb-1 text-[#d6d6d6]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-4 px-3 py-2 rounded-lg bg-[#171613] border border-[#40434E]/40 text-white"
                  placeholder="you@restaurant.com"
                  autoComplete="email"
                />

                <label className="block text-sm mb-1 text-[#d6d6d6]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mb-4 px-3 py-2 rounded-lg bg-[#171613] border border-[#40434E]/40 text-white"
                  placeholder={mode === "signup" ? "Min 6 characters" : "••••••••"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />

                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={handleAuth}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-[#702632] hover:bg-[#912F40] disabled:opacity-60"
                  >
                    {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                  </button>

                  {mode === "signin" && (
                    <button
                      onClick={handleReset}
                      disabled={loading || !email}
                      className="px-4 py-2 rounded-lg border border-[#40434E]/40 hover:border-[#F3C77E] disabled:opacity-60"
                    >
                      Reset password
                    </button>
                  )}
                </div>

                <button
                  onClick={signInWithGoogle}
                  className="w-full px-4 py-2 rounded-lg bg-white text-black hover:opacity-90"
                >
                  Continue with Google
                </button>

                {msg && (
                  <p className={`mt-4 text-sm ${msg.includes("Account created") || msg.includes("Signed in")
                      ? "text-green-400"
                      : "text-[#d6d6d6]"
                    }`}>
                    {msg}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-[#40434E]/40 bg-[#0f0e0c]">
                <p className="mb-4">You’re already signed in.</p>
                <Link
                  to="/dashboard"
                  className="inline-block px-4 py-2 rounded-lg bg-[#702632] hover:bg-[#912F40] transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <StyleInjection />
    </div>
  );
}

function StyleInjection() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .scanlines-move {
        background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
        background-size: 100% 2px;
        animation: scanlineShift 8s linear infinite;
      }
      @keyframes scanlineShift { 0% { background-position: 0 0; } 100% { background-position: 0 2px; } }
      @media (prefers-reduced-motion: reduce) { .scanlines-move { animation: none; } }

      .fade-in-bottom { animation: fade-in-bottom 0.8s ease-out both; }
      .fade-in-bottom-delay { animation: fade-in-bottom 0.8s ease-out 0.2s both; }
      @keyframes fade-in-bottom { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }

      @keyframes pulseQR { 0% { transform: scale(0.96); opacity: 0.18; } 50% { transform: scale(1.04); opacity: 0.35; } 100% { transform: scale(0.96); opacity: 0.18; } }
      .animate-pulseQR { animation: pulseQR 2.6s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}
