import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit3, ExternalLink, Trash2, QrCode, Upload } from "lucide-react";

import BulkMenuImport from "./BulkMenuImport";
import { usePlan } from "../context/PlanContext";
import { useAuth } from "../context/AuthContext";

export default function MenuManager({ onEditMenu, onCreateMenu }) {
  const { user, session } = useAuth();
  const { canCreateMenu, getMenuLimit, userPlan, upgradeTo } = usePlan();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    if (user) loadMenus();
  }, [user]);

  const ping = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(""), 3000);
  };

  const loadMenus = async () => {
    try {
      const res = await fetch("/api/menus/mine/list", {
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      });

      // Check if response has content before parsing JSON
      const text = await res.text();
      if (!text) {
        console.warn("Empty response from /api/menus/mine/list");
        setMenus([]);
        return;
      }

      const data = JSON.parse(text);
      if (res.ok) setMenus(data.menus || []);
    } catch (err) {
      console.error("Failed to load menus", err);
      setMenus([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    if (!canCreateMenu(menus.length)) {
      ping(
        `${userPlan === "free" ? "Free" : "Starter"} plan limited to ${getMenuLimit()} menu${getMenuLimit() > 1 ? "s" : ""}`,
        "error"
      );
      return;
    }
    onCreateMenu();
  };

  const handleDeleteMenu = async (menuId, slug) => {
    if (!confirm(`Delete "${slug}" menu? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/menus/${menuId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setMenus((prev) => prev.filter((m) => m.id !== menuId));
      ping("✅ Menu deleted successfully");
    } catch {
      ping("Failed to delete menu", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#F3C77E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">My Menus</h2>
          <p className="text-[#a7a7a7] text-sm">
            {menus.length} of {getMenuLimit() === -1 ? "∞" : getMenuLimit()} menus used
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#40434E]/50 text-[#d6d6d6] rounded-xl hover:border-[#F3C77E]/50 hover:text-[#F3C77E] transition-all"
          >
            <Upload size={18} />
            Import CSV
          </button>

          <button
            onClick={handleCreateNew}
            disabled={!canCreateMenu(menus.length)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${canCreateMenu(menus.length)
              ? "bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black hover:scale-105"
              : "bg-[#40434E]/20 text-[#666] cursor-not-allowed"
              }`}
          >
            <Plus size={20} />
            New Menu
          </button>
        </div>
      </div>

      {/* Plan Limit Warning */}
      {!canCreateMenu(menus.length) && (
        <div className="p-4 bg-[#F3C77E]/10 border border-[#F3C77E]/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-[#F3C77E]">Menu Limit Reached</h4>
              <p className="text-xs text-[#d6d6d6] mt-1">
                {userPlan === "free" ? "Free" : "Starter"} plan allows {getMenuLimit()} menu
                {getMenuLimit() > 1 ? "s" : ""} maximum
              </p>
            </div>
            <button
              onClick={() => upgradeTo(userPlan === "free" ? "starter" : "pro")}
              className="px-3 py-1 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-lg text-xs font-medium hover:scale-105 transition-transform"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Menus Grid */}
      {menus.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-white mb-2">No menus yet</h3>
          <p className="text-[#a7a7a7] mb-6">Create your first digital menu to get started</p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-transform"
          >
            Create Your First Menu
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <motion.div
              key={menu.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6 hover:border-[#F3C77E]/50 transition-all duration-300"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-1 truncate">{menu.title}</h3>
                <p className="text-sm text-[#a7a7a7] mb-2">scandish.ca/menu/{menu.slug}</p>
                <p className="text-xs text-[#666]">
                  Updated {new Date(menu.updated_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditMenu(menu)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#40434E]/20 hover:bg-[#F3C77E]/20 text-white hover:text-[#F3C77E] rounded-lg text-sm transition-colors"
                >
                  <Edit3 size={16} />
                  Edit
                </button>

                <a
                  href={`/menu/${menu.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center p-2 bg-[#40434E]/20 hover:bg-[#702632]/20 text-white hover:text-[#702632] rounded-lg transition-colors"
                  title="View menu"
                >
                  <ExternalLink size={16} />
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/menu/${menu.slug}`
                    );
                    ping("📋 Menu link copied!");
                  }}
                  className="flex items-center justify-center p-2 bg-[#40434E]/20 hover:bg-[#F3C77E]/20 text-white hover:text-[#F3C77E] rounded-lg transition-colors"
                  title="Copy QR link"
                >
                  <QrCode size={16} />
                </button>

                <button
                  onClick={() => handleDeleteMenu(menu.id, menu.slug)}
                  className="flex items-center justify-center p-2 bg-[#40434E]/20 hover:bg-red-500/20 text-white hover:text-red-400 rounded-lg transition-colors"
                  title="Delete menu"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bulk Import */}
      {showBulkImport && (
        <BulkMenuImport
          onImportComplete={(newMenu) => {
            setShowBulkImport(false);
            onEditMenu(newMenu);
            ping(`✅ Imported ${newMenu.items.length} items into "${newMenu.title}"`);
          }}
          onClose={() => setShowBulkImport(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl backdrop-blur-xl border text-white shadow-2xl ${toast.type === "error"
            ? "bg-red-500/90 border-red-400/40"
            : "bg-[#0f0e0c]/90 border-[#40434E]/40"
            }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={toast.type === "error" ? "text-red-200" : "text-[#F3C77E]"}
            >
              {toast.type === "error" ? "⚠️" : "✓"}
            </span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
