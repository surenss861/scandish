import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import DragDropMenuEditor from "../components/DragDropMenuEditor.jsx";
import UnifiedBrandingPreview from "../components/UnifiedBrandingPreview.jsx";
import QrPreview from "../components/QrPreview.jsx";

import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext.jsx";
import { usePlan } from "../context/PlanContext.jsx";
import MenuContentService from "../services/menuContentService";

/** Safely parse JSON (handles empty/non-JSON responses) */
async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text().catch(() => "");
  if (!text) return {};
  if (ct.includes("application/json")) {
    try { return JSON.parse(text); } catch { return {}; }
  }
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasFeature, userPlan, getMenuLimit, upgradeTo, canCreateMenu } = usePlan();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [hasExistingMenu, setHasExistingMenu] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Saved menu content state
  const [savedMenuContent, setSavedMenuContent] = useState(null);
  const [loadingMenuContent, setLoadingMenuContent] = useState(false);

  const publicUrl = `${window.location.origin}/menu/${slug || "your-slug"}`;

  // redirect to /login if not signed in
  useEffect(() => {
    // TEMPORARY: Disable auth redirect for testing - RESTORE FOR PRODUCTION
    if (false && !user) navigate("/login", { replace: true });
  }, [user, navigate]);

  // Load existing menu on component mount
  useEffect(() => {
    if (!user) return;

    const loadUserMenu = async () => {
      try {
        const res = await fetch("/api/menus/mine/list", {
          headers: {
            "Authorization": `Bearer ${user.access_token || ''}`
          }
        });

        const data = await safeJson(res);

        if (res.ok && data.menus && data.menus.length > 0) {
          // User has existing menus - load the first one
          const firstMenu = data.menus[0];
          setSlug(firstMenu.slug);
          setTitle(firstMenu.title);
          setHasExistingMenu(true);

          // Load menu items
          const menuRes = await fetch(`/api/menus/${firstMenu.slug}`);
          const menuData = await safeJson(menuRes);

          if (menuRes.ok && menuData.items) {
            setItems(menuData.items);
          }
        } else {
          // New user - set up defaults
          setIsNewUser(true);
          setSlug(`${user.email?.split('@')[0] || 'my'}-restaurant`.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
          setTitle("My Restaurant");
          setItems([
            {
              id: "item-1",
              name: "Margherita Pizza",
              description: "Fresh mozzarella, tomato sauce, and basil",
              price: 16.99,
              category: "Pizza",
              emoji: "🍕",
              sort_order: 0
            },
            {
              id: "item-2",
              name: "Caesar Salad",
              description: "Crisp romaine, parmesan, croutons, caesar dressing",
              price: 12.99,
              category: "Salads",
              emoji: "🥗",
              sort_order: 1
            },
            {
              id: "item-3",
              name: "Craft Beer",
              description: "Local brewery selection",
              price: 6.99,
              category: "Beverages",
              emoji: "🍺",
              sort_order: 2
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to load menu:", error);
        // Set defaults on error
        setSlug("");
        setTitle("My Restaurant");
        setItems([]);
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserMenu();
  }, [user]);

  // Load saved menu content
  const loadSavedMenuContent = async () => {
    if (!user?.id) return;

    try {
      setLoadingMenuContent(true);
      const content = await MenuContentService.loadMenuContent(user.id);
      if (content) {
        setSavedMenuContent(content);
        // Update local state with saved content
        setTitle(content.title);
        setItems(content.items);
      }
    } catch (error) {
      console.error('Failed to load saved menu content:', error);
    } finally {
      setLoadingMenuContent(false);
    }
  };

  // Load menu content on mount
  useEffect(() => {
    loadSavedMenuContent();
  }, [user?.id]);

  // Listen for menu content updates
  useEffect(() => {
    const handleMenuContentUpdate = (event) => {
      if (event.detail?.menuContent) {
        setSavedMenuContent(event.detail.menuContent);
        setTitle(event.detail.menuContent.title);
        setItems(event.detail.menuContent.items);
      }
    };

    window.addEventListener('menuContentUpdated', handleMenuContentUpdate);
    return () => {
      window.removeEventListener('menuContentUpdated', handleMenuContentUpdate);
    };
  }, []);

  // subtle background vibe
  useEffect(() => {
    if (document.getElementById("dash-styles")) return;
    const s = document.createElement("style");
    s.id = "dash-styles";
    s.innerHTML = `
      .scanlines{background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px);background-size:100% 2px;animation:scan 9s linear infinite}
      @keyframes scan{0%{background-position:0 0}100%{background-position:0 2px}}
      @media (prefers-reduced-motion:reduce){.scanlines{animation:none}}
    `;
    document.head.appendChild(s);
  }, []);

  const ping = (msg, type = "success") => {
    setToast({ message: msg, type });
    window.clearTimeout(ping._t);
    ping._t = window.setTimeout(() => setToast(""), 3000);
  };

  const saveMenu = async () => {
    if (!slug.trim() || !title.trim()) {
      ping("Please fill in restaurant name and URL", "error");
      return;
    }

    setLoading(true);
    try {
      const method = hasExistingMenu ? "PUT" : "POST";
      const url = hasExistingMenu ? `/api/menus/${slug}` : "/api/menus";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.access_token || ''}`
        },
        body: JSON.stringify({
          user_id: user?.id || '',
          slug,
          title,
          items,
        }),
      });

      const json = await safeJson(res);

      if (!res.ok) {
        // Handle plan limit exceeded specially
        if (json.code === 'PLAN_LIMIT_EXCEEDED') {
          ping(`${json.error} Click "Upgrade" above!`, "error");
          return;
        }
        throw new Error(json.error || "Failed to save menu");
      }

      setHasExistingMenu(true);
      setIsNewUser(false);
      ping("✅ Menu saved successfully!");

    } catch (e) {
      ping(e.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const makeAndStoreQR = async () => {
    try {
      const res = await fetch(`/api/qr/${encodeURIComponent(slug)}`);
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json.error || "QR failed");
      ping("📱 QR code ready for download!");
    } catch (e) {
      ping(e.message || "QR failed", "error");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      ping("📋 Link copied to clipboard!");
    } catch {
      ping("Copy failed", "error");
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#080705] text-[#FFFFFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F3C77E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#a7a7a7]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080705] text-[#FFFFFA] overflow-hidden">
      {/* Enhanced animated background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(243, 199, 126, 0.2) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(112, 38, 50, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 60% 40%, rgba(243, 199, 126, 0.1) 0%, transparent 40%),
            linear-gradient(45deg, transparent 24%, rgba(255, 255, 250, 0.03) 25%, rgba(255, 255, 250, 0.03) 26%, transparent 27%, transparent 74%, rgba(255, 255, 250, 0.03) 75%, rgba(255, 255, 250, 0.03) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '400px 400px, 600px 600px, 300px 300px, 20px 20px',
          animation: 'gridMove 25s linear infinite, breathe 8s ease-in-out infinite'
        }}
      />

      {/* Floating magical orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#F3C77E]/15 to-[#702632]/10 rounded-full blur-3xl animate-pulse" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#702632]/8 to-[#F3C77E]/12 rounded-full blur-3xl animate-pulse" style={{ animation: 'float 8s ease-in-out infinite reverse', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-[#F3C77E]/20 to-[#d6a856]/15 rounded-full blur-2xl" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '4s' }} />
      </div>

      {/* Shimmer overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(45deg, transparent 40%, rgba(243, 199, 126, 0.1) 50%, transparent 60%)',
          animation: 'shimmerSweep 10s ease-in-out infinite'
        }}
      />

      {/* HEADER */}
      <header className="relative z-10 border-b border-[#40434E]/40 backdrop-blur-sm bg-[#13110e]/80">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-6 md:pt-10 md:pb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#F3C77E]/80 font-medium">
                <span>✨</span>
                <span>Scandish Studio</span>
                {isNewUser && (
                  <span className="ml-2 px-2 py-1 bg-[#F3C77E]/20 text-[#F3C77E] rounded-full text-xs">
                    Welcome!
                  </span>
                )}
                <span className="ml-2 px-2 py-1 bg-[#40434E]/20 text-[#d6d6d6] rounded-full text-xs capitalize">
                  {userPlan} Plan
                </span>
                {userPlan === 'free' && (
                  <button
                    onClick={() => upgradeTo('starter')}
                    className="ml-1 px-2 py-1 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-full text-xs font-medium hover:scale-105 transition-transform"
                  >
                    Upgrade
                  </button>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-[#FFFFFA] via-[#F3C77E] to-[#F3C77E] bg-clip-text text-transparent">
                Dashboard <span className="text-[#F3C77E]">/ {title || "My Restaurant"}</span>
              </h1>
              <button
                type="button"
                onClick={copyLink}
                className="group flex items-center gap-2 text-sm text-[#d6d6d6] hover:text-[#F3C77E] transition-colors"
                title="Copy public link"
              >
                <span>🔗</span>
                <span className="font-mono text-xs bg-[#40434E]/20 px-2 py-1 rounded border border-[#40434E]/40 group-hover:border-[#F3C77E]/50 transition-colors">
                  {publicUrl}
                </span>
                <span className="text-xs opacity-60">Click to copy</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={signOut}
                className="group relative px-4 py-2 rounded-xl border border-[#40434E]/50 bg-[#0f0e0c]/80 backdrop-blur-sm hover:border-red-400/50 hover:bg-red-400/10 text-sm transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Sign out</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative px-4 py-2 rounded-xl border border-[#40434E]/50 bg-[#0f0e0c]/80 backdrop-blur-sm hover:border-[#702632]/50 hover:bg-[#702632]/10 text-sm transition-all duration-300 flex items-center gap-2 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="group-hover:animate-bounce">📱</span>
                  Preview
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#702632]/20 to-[#F3C77E]/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
              </a>
              <button
                type="button"
                onClick={saveMenu}
                disabled={loading}
                className="group relative px-6 py-2 rounded-xl bg-gradient-to-r from-[#F3C77E] via-[#F3C77E] to-[#d6a856] text-[#080705] font-semibold hover:from-[#d6a856] hover:via-[#F3C77E] hover:to-[#F3C77E] disabled:opacity-60 transition-all duration-300 shadow-lg shadow-[#F3C77E]/25 hover:shadow-[#F3C77E]/50 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <span className="group-hover:animate-pulse">💾</span>
                      {hasExistingMenu ? 'Update Menu' : 'Save Menu'}
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#d6a856]/30 to-[#F3C77E]/30 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* New User Welcome Message */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-gradient-to-r from-[#F3C77E]/10 to-[#d6a856]/10 border-b border-[#F3C77E]/20"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👋</span>
              <div>
                <h3 className="font-semibold text-[#F3C77E]">Welcome to Scandish!</h3>
                <p className="text-sm text-[#d6d6d6]">
                  We've added some sample items to get you started. Edit them below, then save your menu!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* MAIN */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* LEFT: Builder */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="group relative rounded-3xl bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 p-8 shadow-2xl shadow-black/50 hover:shadow-[#F3C77E]/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
        >
          {/* Enhanced glassmorphic glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#40434E]/5 via-transparent to-[#F3C77E]/5 pointer-events-none" />
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#F3C77E]/20 via-[#702632]/20 to-[#F3C77E]/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Section divider */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#F3C77E]/30 to-transparent" />

          <div className="relative z-10">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="flex items-center gap-3 text-2xl font-serif font-bold text-white mb-2">
                <span className="text-2xl">🍴</span>
                Menu Builder
              </h2>
              <p className="text-[#a7a7a7]">Design your digital menu with drag-and-drop simplicity</p>
            </div>

            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#d6d6d6]">Restaurant Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50 focus:border-[#F3C77E]/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="My Amazing Restaurant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#d6d6d6]">Menu URL</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="w-full rounded-xl px-4 py-3 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50 focus:border-[#F3C77E]/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="my-restaurant"
                  />
                  <p className="text-xs text-[#a7a7a7] mt-2 flex items-center gap-1">
                    <span>🔗</span>
                    <code className="bg-[#40434E]/20 px-2 py-1 rounded text-[#F3C77E]">/menu/{slug || "your-slug"}</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <DragDropMenuEditor
                menuItems={items}
                setMenuItems={setItems}
                onAdded={() => ping("✅ Item added")}
                showImages={hasFeature('photoUploads')}
              />

              {/* Plan limitations notice */}
              {userPlan === 'free' && (
                <div className="mt-4 p-4 bg-[#F3C77E]/10 border border-[#F3C77E]/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-[#F3C77E]">Free Plan Limitations</h4>
                      <p className="text-xs text-[#d6d6d6] mt-1">
                        • Limited to {getMenuLimit()} menu
                        • No photo uploads
                        • Scandish watermark on public menu
                      </p>
                    </div>
                    <button
                      onClick={() => upgradeTo('starter')}
                      className="px-3 py-1 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-lg text-xs font-medium hover:scale-105 transition-transform"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* RIGHT: Preview + QR */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Phone Preview */}
          <div className="group relative rounded-3xl bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 p-6 shadow-2xl shadow-black/50 hover:shadow-[#702632]/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
            {/* Enhanced glassmorphic glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#40434E]/5 via-transparent to-[#702632]/5 pointer-events-none" />
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#702632]/20 via-[#F3C77E]/20 to-[#702632]/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Section divider */}
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#702632]/30 to-transparent" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl group-hover:animate-bounce">📱</span>
                <h3 className="text-xl font-serif font-bold text-white">Live Preview</h3>
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-[#F3C77E] rounded-full animate-pulse" />
                </div>
              </div>

              {/* Enhanced Phone Mockup with 3D effects */}
              <div className="relative mx-auto max-w-sm">
                {/* Glowing background aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#702632]/20 via-[#F3C77E]/30 to-[#702632]/20 rounded-[4rem] blur-2xl scale-110 animate-pulse" />

                <div className="relative bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl shadow-black/80 border border-gray-600/50">
                  {/* Enhanced 3D phone reflection */}
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-white/30 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-bl from-transparent via-transparent to-white/5 pointer-events-none" />

                  {/* Screen */}
                  <div className="relative bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />

                    {/* Screen content */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-[500px] p-4 pt-8 overflow-y-auto max-h-[500px]">
                      <UnifiedBrandingPreview title={title} items={items} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="group relative rounded-3xl bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 p-6 shadow-2xl shadow-black/50 hover:shadow-[#F3C77E]/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
            {/* Enhanced glassmorphic glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#40434E]/5 via-transparent to-[#F3C77E]/5 pointer-events-none" />
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#F3C77E]/20 via-[#d6a856]/20 to-[#F3C77E]/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Section divider */}
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#F3C77E]/30 to-transparent" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl group-hover:animate-spin">🔗</span>
                <h3 className="text-xl font-serif font-bold text-white">QR Code</h3>
                <div className="ml-auto group-hover:opacity-100 opacity-60 transition-opacity">
                  <span className="text-xs bg-[#F3C77E]/20 text-[#F3C77E] px-2 py-1 rounded-full border border-[#F3C77E]/30">
                    Scan Ready
                  </span>
                </div>
              </div>

              <div className="text-center">
                {/* QR Code with Premium Frame */}
                <div className="relative inline-block">
                  <div className="relative p-4 bg-gradient-to-br from-white via-[#F3C77E]/20 to-[#F3C77E]/40 rounded-2xl shadow-lg">
                    {/* Gold accent frame */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F3C77E] via-[#d6a856] to-[#F3C77E] p-[2px]">
                      <div className="rounded-2xl bg-white h-full w-full" />
                    </div>
                    <div className="relative z-10 p-2">
                      <QrPreview url={publicUrl} size={160} />
                    </div>

                    {/* Enhanced shimmer effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-[#F3C77E]/40 to-transparent animate-shimmer" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-l from-transparent via-white/30 to-transparent animate-shimmer" style={{ animationDelay: '1s' }} />
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="mt-6 flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="group relative px-4 py-2 rounded-xl bg-[#40434E]/20 border border-[#40434E]/40 text-white hover:bg-[#40434E]/30 hover:border-[#F3C77E]/50 transition-all duration-300 text-sm font-medium flex items-center gap-2 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="group-hover:animate-bounce">📋</span>
                      Copy Link
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F3C77E]/20 to-[#702632]/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                  </button>
                  <button
                    type="button"
                    onClick={makeAndStoreQR}
                    className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#080705] hover:from-[#d6a856] hover:to-[#F3C77E] transition-all duration-300 text-sm font-semibold shadow-lg shadow-[#F3C77E]/25 hover:shadow-[#F3C77E]/40 flex items-center gap-2 hover:scale-105 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="group-hover:animate-bounce">💾</span>
                      Download QR
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d6a856]/30 to-[#F3C77E]/30 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>

                {/* URL Display */}
                <div className="mt-4 p-3 bg-[#40434E]/10 rounded-xl border border-[#40434E]/20">
                  <p className="text-xs text-[#a7a7a7] mb-1">Your menu URL:</p>
                  <code className="text-sm text-[#F3C77E] font-mono break-all">{publicUrl}</code>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 py-12 text-center border-t border-[#40434E]/40 backdrop-blur-sm bg-[#13110e]/50 overflow-hidden">
        {/* Floating sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-1/4 w-1 h-1 bg-[#F3C77E] rounded-full animate-ping" />
          <div className="absolute top-8 right-1/3 w-1 h-1 bg-[#F3C77E] rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-6 left-1/3 w-1 h-1 bg-[#F3C77E] rounded-full animate-ping" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-4 right-1/4 w-1 h-1 bg-[#F3C77E] rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <p className="text-sm text-[#a7a7a7] flex items-center justify-center gap-2">
            © {new Date().getFullYear()}
            <a
              href="/"
              className="text-[#F3C77E] hover:text-[#d6a856] transition-colors font-medium"
            >
              Scandish Studio
            </a>
            . Crafted with
            <span className="inline-block animate-pulse text-[#F3C77E]">✨</span>
            for restaurants worldwide.
          </p>
        </div>
      </footer>

      {/* Enhanced TOAST */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl backdrop-blur-xl border text-white shadow-2xl shadow-black/50 ${toast.type === "error"
            ? "bg-red-500/90 border-red-400/40"
            : "bg-[#0f0e0c]/90 border-[#40434E]/40"
            }`}
        >
          <div className="flex items-center gap-2">
            <span className={toast.type === "error" ? "text-red-200" : "text-[#F3C77E]"}>
              {toast.type === "error" ? "⚠️" : "✓"}
            </span>
            <span className="text-sm font-medium">{toast.message || toast}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}