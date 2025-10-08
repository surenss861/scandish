import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import DashboardSidebar from "../components/DashboardSidebar.jsx";
import MenuManager from "../components/MenuManager.jsx";
import AdvancedAnalytics from "../components/AdvancedAnalytics.jsx";
import SimpleAnalytics from "../components/SimpleAnalytics.jsx";
import MultiLocationManager from "../components/MultiLocationManager.jsx";
import { Navigate } from 'react-router-dom';
import MenuTemplates from "../components/MenuTemplates.jsx";
import DragDropMenuEditor from "../components/DragDropMenuEditor.jsx";
import UnifiedBrandingPreview from "../components/UnifiedBrandingPreview.jsx";
import QrPreview from "../components/QrPreview.jsx";
import BillingManager from "../components/BillingManager.jsx";
import AccountDashboard from "../components/AccountDashboard.jsx";
import FeatureUnlockNotification from "../components/FeatureUnlockNotification.jsx";
import { AnalyticsUpgradePrompt, LocationsUpgradePrompt, TemplatesUpgradePrompt } from "../components/PlanUpgradePrompt.jsx";
// Removed dev-only buttons in production

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
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export default function NewDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, session } = useAuth(); // session holds access_token
  const { hasFeature, userPlan } = usePlan();

  const [activeSection, setActiveSection] = useState("menus");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Debug logging for section changes
  useEffect(() => {
    console.log('🎯 Active section changed to:', activeSection);
  }, [activeSection]);

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

  // Menu state
  const [editingMenu, setEditingMenu] = useState(null);
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([]);

  // Saved menu content state
  const [savedMenuContent, setSavedMenuContent] = useState(null);
  const [loadingMenuContent, setLoadingMenuContent] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const publicUrl = `${window.location.origin}/menu/${slug || "your-slug"}`;

  // redirect to /login if not signed in
  useEffect(() => {
    if (!user) {
      console.log("NewDashboard - No user, redirecting to login");
      navigate("/login", { replace: true });
    } else {
      console.log("NewDashboard - Authenticated user:", user.email);
    }
  }, [user, navigate]);

  // Handle URL parameters for section
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  /** Toast helper */
  const ping = (msg, type = "success") => {
    setToast({ message: msg, type });
    window.clearTimeout(ping._t);
    ping._t = window.setTimeout(() => setToast(""), 3000);
  };

  /** Fetch wrapper with Supabase token */
  const authedFetch = async (url, options = {}) => {
    const token = session?.access_token;
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  };

  /** Menu actions */
  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setSlug(menu.slug);
    setTitle(menu.title);
    loadMenuItems(menu.slug);
    setActiveSection("edit");
  };

  const handleCreateMenu = () => {
    // Navigate to custom branding instead of templates
    navigate('/branding/logo');
  };

  const handleSelectTemplate = (template) => {
    setShowTemplates(false);
    if (template) {
      setTitle(template.name);
      setSlug(template.name.toLowerCase().replace(/[^a-z0-9]/g, "-"));
      setItems(
        template.items.map((item) => ({
          ...item,
          id: Date.now().toString() + Math.random(),
        }))
      );
    } else {
      setTitle("");
      setSlug("");
      setItems([]);
    }
    setActiveSection("edit");
  };

  const loadMenuItems = async (menuSlug) => {
    try {
      const res = await authedFetch(`/api/menus/${menuSlug}`);
      const data = await safeJson(res);
      if (res.ok && data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error("Failed to load menu items:", error);
    }
  };

  const saveMenu = async () => {
    if (!slug.trim() || !title.trim()) {
      ping("Please fill in restaurant name and URL", "error");
      return;
    }

    setLoading(true);
    try {
      const method = editingMenu && !isCreatingMenu ? "PUT" : "POST";
      const url =
        editingMenu && !isCreatingMenu
          ? `/api/menus/${editingMenu.id}`
          : "/api/menus";

      const res = await authedFetch(url, {
        method,
        body: JSON.stringify({
          user_id: user?.id,
          slug,
          title,
          items,
        }),
      });

      const json = await safeJson(res);

      if (!res.ok) {
        if (json.code === "PLAN_LIMIT_EXCEEDED") {
          ping(`${json.error} Click upgrade in sidebar!`, "error");
          return;
        }
        throw new Error(json.error || "Failed to save menu");
      }

      ping("✅ Menu saved successfully!");
      setIsCreatingMenu(false);
      setActiveSection("menus");
    } catch (e) {
      ping(e.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /** Sign out */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  /** Main content renderer */
  const renderMainContent = () => {
    switch (activeSection) {
      case "menus":
        return (
          <MenuManager
            onEditMenu={handleEditMenu}
            onCreateMenu={handleCreateMenu}
          />
        );

      case "templates":
        return (
          <TemplatesUpgradePrompt>
            <MenuTemplates
              onSelectTemplate={handleSelectTemplate}
              onClose={() => setActiveSection("menus")}
            />
          </TemplatesUpgradePrompt>
        );

      case "edit":
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {isCreatingMenu ? "Create New Menu" : `Edit ${title || "Menu"}`}
                </h2>
                <p className="text-[#a7a7a7] text-sm">
                  {isCreatingMenu
                    ? "Build your digital menu from scratch"
                    : "Make changes to your menu"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveSection("menus")}
                  className="px-4 py-2 border border-[#40434E]/50 text-[#d6d6d6] rounded-xl hover:border-[#F3C77E]/50 transition-colors"
                >
                  ← Back to Menus
                </button>
                <button
                  onClick={saveMenu}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {loading
                    ? "Saving..."
                    : isCreatingMenu
                      ? "Create Menu"
                      : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
              {/* Menu Builder */}
              <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Menu Details
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#d6d6d6]">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50 focus:border-[#F3C77E]/50 transition-all duration-200"
                      placeholder="My Amazing Restaurant"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#d6d6d6]">
                      Menu URL
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) =>
                        setSlug(
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                        )
                      }
                      className="w-full rounded-xl px-4 py-3 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50 focus:border-[#F3C77E]/50 transition-all duration-200"
                      placeholder="my-restaurant"
                    />
                  </div>
                </div>

                <DragDropMenuEditor
                  menuItems={items}
                  setMenuItems={setItems}
                  onAdded={() => ping("✅ Item added")}
                  showImages={hasFeature("photoUploads")}
                  userId={user?.id}
                  menuId={editingMenu?.id || slug}
                />
              </div>

              {/* Preview */}
              <div className="space-y-6">
                <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Live Preview
                  </h3>
                  <div className="bg-white rounded-xl p-4 max-h-96 overflow-y-auto">
                    <UnifiedBrandingPreview title={title} items={items} />
                  </div>
                </div>

                <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    QR Code
                  </h3>
                  <div className="text-center">
                    <QrPreview url={publicUrl} size={200} />
                    <p className="text-xs text-[#a7a7a7] mt-2 break-all">
                      {publicUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );


      case "analytics":
        return (
          <AnalyticsUpgradePrompt>
            <SimpleAnalytics />
          </AnalyticsUpgradePrompt>
        );

      case "locations":
        return (
          <LocationsUpgradePrompt>
            <MultiLocationManager />
          </LocationsUpgradePrompt>
        );

      case "branding":
        return <Navigate to="/branding/logo" replace />;

      case "account":
        return (
          <AccountDashboard
            user={user}
            onSignOut={signOut}
          />
        );

      case "marketing":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Marketing Solutions</h2>
                <p className="text-[#a7a7a7] text-sm">Partner with Warbuoy Marketing for complete business growth</p>
              </div>
            </div>

            {/* Marketing Website Embed */}
            <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Warbuoy Marketing</h3>
                <p className="text-[#d6d6d6] text-sm">Complete business growth solutions from profitable ads to AI automation</p>
              </div>

              {/* Website Container */}
              <div className="relative">
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl" style={{ height: '600px' }}>
                  <iframe
                    src="https://www.warbuoymarketing.ca/"
                    className="w-full h-full border-0"
                    title="Warbuoy Marketing"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                    loading="lazy"
                  />
                </div>

                {/* Overlay with external link */}
                <div className="absolute top-4 right-4">
                  <a
                    href="https://www.warbuoymarketing.ca/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Website
                  </a>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-xl p-6">
                <div className="text-3xl mb-3">📈</div>
                <h4 className="text-lg font-semibold text-white mb-2">Profitable Ads</h4>
                <p className="text-[#d6d6d6] text-sm">Facebook, Google, TikTok, and LinkedIn ads that actually convert with ROI tracking.</p>
              </div>

              <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-xl p-6">
                <div className="text-3xl mb-3">🤖</div>
                <h4 className="text-lg font-semibold text-white mb-2">AI Automation</h4>
                <p className="text-[#d6d6d6] text-sm">Streamline your business with intelligent automation and AI-powered workflows.</p>
              </div>

              <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-xl p-6">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="text-lg font-semibold text-white mb-2">CRM Management</h4>
                <p className="text-[#d6d6d6] text-sm">Complete customer relationship management with lead capture and automated follow-ups.</p>
              </div>

              <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-xl p-6">
                <div className="text-3xl mb-3">💻</div>
                <h4 className="text-lg font-semibold text-white mb-2">Web Development</h4>
                <p className="text-[#d6d6d6] text-sm">Modern, fast, and conversion-optimized websites with mobile-first development.</p>
              </div>

              <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-xl p-6">
                <div className="text-3xl mb-3">✅</div>
                <h4 className="text-lg font-semibold text-white mb-2">30-Day Trial</h4>
                <p className="text-[#d6d6d6] text-sm">Experience full service for 30 days with money-back guarantee. No long-term contracts.</p>
              </div>

              <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-xl p-6">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="text-lg font-semibold text-white mb-2">Fast Results</h4>
                <p className="text-[#d6d6d6] text-sm">See initial results in 2-4 weeks with rapid implementation and continuous optimization.</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#F3C77E]/10 to-[#d4a574]/10 border border-[#F3C77E]/20 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Scale Your Business?</h3>
              <p className="text-[#d6d6d6] mb-6 max-w-2xl mx-auto">
                Join businesses that are already growing with proven strategies and modern tools.
                Get a personalized growth strategy tailored to your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://www.warbuoymarketing.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Book Free Strategy Call
                </a>
                <a
                  href="https://www.warbuoymarketing.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 border border-[#F3C77E]/50 text-[#F3C77E] rounded-xl font-semibold hover:border-[#F3C77E] hover:bg-[#F3C77E]/10 transition-all"
                >
                  Start Your Trial
                </a>
              </div>
            </div>
          </div>
        );

      case "updates":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Updates & News</h2>
                <p className="text-[#a7a7a7] text-sm">Stay informed about the latest features and improvements</p>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-lg font-bold text-[#F3C77E]">October 8, 2025</span>
                Latest Updates
              </h3>

              <div className="space-y-4">
                <div className="bg-[#171613] rounded-xl p-4 border-l-4 border-[#F3C77E]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-white">Company Launch</h4>
                    <span className="text-sm text-[#F3C77E] bg-[#F3C77E]/10 px-2 py-1 rounded-full">New</span>
                  </div>
                  <p className="text-[#d6d6d6] text-sm mb-2">
                    Scandish officially launches! Start creating beautiful digital menus for your restaurant today.
                  </p>
                  <span className="text-xs text-[#a7a7a7]">October 8, 2025</span>
                </div>
              </div>
            </div>

            {/* Upcoming Features */}
            <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔮</span>
                Coming Soon
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#171613] rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Multi-language Support</h4>
                  <p className="text-[#d6d6d6] text-sm">Support for multiple languages to serve diverse customer bases.</p>
                </div>
                <div className="bg-[#171613] rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Advanced Ordering</h4>
                  <p className="text-[#d6d6d6] text-sm">Direct ordering integration with kitchen management systems.</p>
                </div>
                <div className="bg-[#171613] rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Social Media Integration</h4>
                  <p className="text-[#d6d6d6] text-sm">Share menu updates directly to social media platforms.</p>
                </div>
                <div className="bg-[#171613] rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Advanced Reporting</h4>
                  <p className="text-[#d6d6d6] text-sm">Detailed reports and insights for business optimization.</p>
                </div>
                <div className="bg-[#171613] rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Enhanced Menu Design</h4>
                  <p className="text-[#d6d6d6] text-sm">Make the menus look better with improved layouts and visual appeal.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Contact & Support</h2>
                <p className="text-[#a7a7a7] text-sm">Get help, report issues, or get in touch with our team</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">✉️</span>
                Send us a Message
              </h3>

              {/* Suggestions */}
              <div className="bg-[#171613]/50 border border-[#F3C77E]/20 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-medium text-[#F3C77E] mb-2 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  What can we help you with?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#d6d6d6]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F3C77E]">•</span>
                    <span>Technical support & troubleshooting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F3C77E]">•</span>
                    <span>Feature requests & suggestions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F3C77E]">•</span>
                    <span>Billing & account questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F3C77E]">•</span>
                    <span>Menu customization help</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F3C77E]">•</span>
                    <span>Bug reports & issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F3C77E]">•</span>
                    <span>Partnership & business inquiries</span>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#171613] border border-[#40434E]/40 rounded-xl text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50 focus:border-[#F3C77E]/50"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-[#171613] border border-[#40434E]/40 rounded-xl text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50 focus:border-[#F3C77E]/50"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[#171613] border border-[#40434E]/40 rounded-xl text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50 focus:border-[#F3C77E]/50"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-[#171613] border border-[#40434E]/40 rounded-xl text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50 focus:border-[#F3C77E]/50 resize-none"
                    placeholder="Tell us more about your question or issue..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        );

      case "read-before-buy":
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Read Before You Buy</h1>
              <p className="text-xl text-[#a7a7a7] max-w-3xl mx-auto">
                Everything you need to know about Scandish - the complete digital menu solution for restaurants
              </p>
            </div>

            {/* What is Scandish */}
            <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">🍽️</span>
                What is Scandish?
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-[#d6d6d6] mb-6">
                  Scandish is a comprehensive digital menu platform designed specifically for restaurants, cafes, and food service businesses.
                  We transform your traditional paper menus into dynamic, interactive digital experiences that your customers can access
                  instantly via QR codes.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#171613] rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-3">🎯 The Problem We Solve</h3>
                    <ul className="text-[#d6d6d6] space-y-2">
                      <li>• Expensive menu printing and reprinting costs</li>
                      <li>• Difficulty updating prices and items quickly</li>
                      <li>• No customer analytics or insights</li>
                      <li>• Limited branding and customization options</li>
                      <li>• Poor mobile experience for customers</li>
                    </ul>
                  </div>
                  <div className="bg-[#171613] rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-3">✨ Our Solution</h3>
                    <ul className="text-[#d6d6d6] space-y-2">
                      <li>• Instant QR code menu access</li>
                      <li>• Real-time menu updates</li>
                      <li>• Detailed customer analytics</li>
                      <li>• Complete branding customization</li>
                      <li>• Mobile-optimized experience</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Features */}
            <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">🚀</span>
                Core Features
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#171613] rounded-xl p-6">
                  <div className="text-3xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold text-white mb-3">QR Code Menus</h3>
                  <p className="text-[#d6d6d6]">Generate instant QR codes that customers scan to access your menu. No app downloads required.</p>
                </div>
                <div className="bg-[#171613] rounded-xl p-6">
                  <div className="text-3xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Custom Branding</h3>
                  <p className="text-[#d6d6d6]">Match your restaurant's unique style with custom colors, fonts, logos, and layouts.</p>
                </div>
                <div className="bg-[#171613] rounded-xl p-6">
                  <div className="text-3xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Analytics Dashboard</h3>
                  <p className="text-[#d6d6d6]">Track customer behavior, popular items, and menu performance with detailed insights.</p>
                </div>
                <div className="bg-[#171613] rounded-xl p-6">
                  <div className="text-3xl mb-4">⚡</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Real-time Updates</h3>
                  <p className="text-[#d6d6d6]">Update prices, add items, or change descriptions instantly across all customer devices.</p>
                </div>
                <div className="bg-[#171613] rounded-xl p-6">
                  <div className="text-3xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-white mb-3">AI Assistant</h3>
                  <p className="text-[#d6d6d6]">Get AI-powered menu suggestions, branding ideas, and marketing copy generation.</p>
                </div>
                <div className="bg-[#171613] rounded-xl p-6">
                  <div className="text-3xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Mobile Optimized</h3>
                  <p className="text-[#d6d6d6]">Perfect mobile experience with fast loading and intuitive navigation for customers.</p>
                </div>
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">💰</span>
                Pricing Plans
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#171613] rounded-xl p-6 border border-[#40434E]/40">
                  <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                  <p className="text-3xl font-bold text-[#F3C77E] mb-4">$0<span className="text-lg text-[#a7a7a7]">/month</span></p>
                  <ul className="text-[#d6d6d6] space-y-2 mb-6">
                    <li>• 1 menu</li>
                    <li>• Basic customization</li>
                    <li>• QR code generation</li>
                    <li>• Basic analytics</li>
                    <li>• Watermark on menu</li>
                  </ul>
                  <button className="w-full py-2 px-4 border border-[#40434E] text-[#d6d6d6] rounded-lg hover:border-[#F3C77E] transition-colors">
                    Current Plan
                  </button>
                </div>
                <div className="bg-[#171613] rounded-xl p-6 border border-[#F3C77E]/50 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                  <p className="text-3xl font-bold text-[#F3C77E] mb-4">$9<span className="text-lg text-[#a7a7a7]">/month</span></p>
                  <ul className="text-[#d6d6d6] space-y-2 mb-6">
                    <li>• Up to 5 menus</li>
                    <li>• Full customization</li>
                    <li>• No watermarks</li>
                    <li>• Advanced analytics</li>
                    <li>• Photo uploads</li>
                    <li>• AI Assistant</li>
                  </ul>
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-lg font-semibold hover:shadow-lg transition-all">
                    Upgrade Now
                  </button>
                </div>
                <div className="bg-[#171613] rounded-xl p-6 border border-[#40434E]/40">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <p className="text-3xl font-bold text-[#F3C77E] mb-4">$29<span className="text-lg text-[#a7a7a7]">/month</span></p>
                  <ul className="text-[#d6d6d6] space-y-2 mb-6">
                    <li>• Unlimited menus</li>
                    <li>• Multi-location support</li>
                    <li>• Bulk import/export</li>
                    <li>• Advanced AI features</li>
                    <li>• Priority support</li>
                    <li>• Custom integrations</li>
                  </ul>
                  <button className="w-full py-2 px-4 border border-[#F3C77E] text-[#F3C77E] rounded-lg hover:bg-[#F3C77E]/10 transition-colors">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">💡</span>
                Why Choose Scandish?
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">For Restaurant Owners</h3>
                  <ul className="space-y-3 text-[#d6d6d6]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>Save thousands on printing costs annually</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>Update menu items and prices instantly</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>Understand customer preferences with analytics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>Professional, modern digital presence</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>Reduce staff workload with self-service ordering</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">For Your Customers</h3>
                  <ul className="space-y-3 text-[#d6d6d6]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>No app downloads required - instant access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>Always up-to-date menu information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>High-quality food photos and descriptions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>Mobile-optimized for easy browsing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F3C77E] mt-1">✓</span>
                      <span>Contactless and hygienic experience</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-r from-[#F3C77E]/10 to-[#d4a574]/10 border border-[#F3C77E]/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Ready to Get Started?</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl mb-4">1️⃣</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Sign Up</h3>
                  <p className="text-[#d6d6d6]">Create your free account in under 2 minutes</p>
                </div>
                <div>
                  <div className="text-4xl mb-4">2️⃣</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Create Your Menu</h3>
                  <p className="text-[#d6d6d6]">Add your items, photos, and customize your design</p>
                </div>
                <div>
                  <div className="text-4xl mb-4">3️⃣</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Print QR Codes</h3>
                  <p className="text-[#d6d6d6]">Download and print your QR codes for tables</p>
                </div>
              </div>
              <div className="text-center mt-8">
                <button className="px-8 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-xl font-semibold hover:shadow-lg transition-all mr-4">
                  Start Free Trial
                </button>
                <button className="px-8 py-3 border border-[#F3C77E] text-[#F3C77E] rounded-xl font-semibold hover:bg-[#F3C77E]/10 transition-all">
                  View Demo
                </button>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-4xl">❓</span>
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <div className="border-b border-[#40434E]/40 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Do customers need to download an app?</h3>
                  <p className="text-[#d6d6d6]">No! Customers simply scan the QR code with their phone's camera and the menu opens instantly in their browser. No app downloads required.</p>
                </div>
                <div className="border-b border-[#40434E]/40 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">How quickly can I update my menu?</h3>
                  <p className="text-[#d6d6d6]">Changes are instant! Update prices, add items, or modify descriptions and they appear on all customer devices immediately.</p>
                </div>
                <div className="border-b border-[#40434E]/40 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">What if customers don't have smartphones?</h3>
                  <p className="text-[#d6d6d6]">We recommend keeping a few printed menus as backup. However, 95%+ of customers have smartphones and can access your digital menu.</p>
                </div>
                <div className="border-b border-[#40434E]/40 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Can I customize the design to match my restaurant?</h3>
                  <p className="text-[#d6d6d6]">Absolutely! You can customize colors, fonts, logos, layouts, and more to perfectly match your restaurant's brand and style.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Is there a contract or can I cancel anytime?</h3>
                  <p className="text-[#d6d6d6]">No contracts! You can cancel or change your plan at any time. We're confident you'll love the results, but you're never locked in.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#080705] text-[#FFFFFA] flex">
      {/* Sidebar */}
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Animated Background */}
        <div
          className="fixed inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(243, 199, 126, 0.1) 0%, transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(112, 38, 50, 0.1) 0%, transparent 60%)
            `,
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8 h-full overflow-y-auto">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderMainContent()}
          </motion.div>
        </div>
      </div>

      {/* Feature Unlock Notification */}
      <FeatureUnlockNotification />

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl backdrop-blur-xl border text-white shadow-2xl ${toast.type === "error"
            ? "bg-red-500/90 border-red-400/40"
            : "bg-[#0f0e0c]/90 border-[#40434E]/40"
            }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={
                toast.type === "error" ? "text-red-200" : "text-[#F3C77E]"
              }
            >
              {toast.type === "error" ? "⚠️" : "✓"}
            </span>
            <span className="text-sm font-medium">
              {toast.message || toast}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
