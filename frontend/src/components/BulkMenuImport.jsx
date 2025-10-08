import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Download, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../context/AuthContext";

const CSV_TEMPLATE = `name,description,price,category,emoji
Margherita Pizza,Fresh mozzarella with tomato sauce and basil,16.99,Pizza,🍕
Caesar Salad,Crisp romaine with parmesan and croutons,12.99,Salads,🥗
Craft Beer,Local brewery selection on tap,5.99,Beverages,🍺
Tiramisu,Classic Italian dessert with mascarpone,8.99,Desserts,🍰`;

export default function BulkMenuImport({ onImportComplete, onClose, isModal = false }) {
  const { user, session } = useAuth();

  const [parsedItems, setParsedItems] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("upload"); // upload, preview, complete

  const onDrop = useCallback((accepted) => {
    const file = accepted[0];
    if (!file) return;
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setErrors(["Please upload a CSV file"]);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target.result);
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const parseCSV = (text) => {
    try {
      const lines = text.trim().split("\n");
      if (lines.length < 2) throw new Error("CSV must include headers + at least 1 row");

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const required = ["name", "price"];
      const missing = required.filter((h) => !headers.includes(h));
      if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`);

      const items = [];
      const errs = [];

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",").map((v) => v.trim());
        const row = {};
        headers.forEach((h, idx) => (row[h] = vals[idx] || ""));

        if (!row.name) {
          errs.push(`Row ${i + 1}: name is required`);
          continue;
        }
        if (row.price && isNaN(parseFloat(row.price))) {
          errs.push(`Row ${i + 1}: invalid price "${row.price}"`);
          continue;
        }

        items.push({
          id: Date.now().toString() + i,
          name: row.name,
          description: row.description || "",
          price: row.price ? parseFloat(row.price) : 0,
          category: row.category || "Menu Items",
          emoji: row.emoji || "🍽️",
          sort_order: i - 1,
        });
      }

      setErrors(errs);
      setParsedItems(items);
      setStep("preview");
    } catch (err) {
      setErrors([err.message]);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scandish-menu-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!user || !session?.access_token) {
      setErrors(["You must be logged in"]);
      return;
    }
    setLoading(true);
    setErrors([]);
    try {
      const payload = {
        user_id: user.id,
        slug: `import-${Date.now()}`,
        title: `Imported Menu (${parsedItems.length} items)`,
        items: parsedItems,
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4100';
      const res = await fetch(`${apiUrl}/api/menus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Failed to import menu`);
      }

      if (onImportComplete) {
        onImportComplete(data.menu || payload);
      }
      setStep("complete");
    } catch (err) {
      console.error('Import error:', err);
      setErrors([err.message]);
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = isModal
    ? "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    : "w-full";

  const contentClasses = isModal
    ? "relative bg-[#0f0e0c]/95 border border-[#40434E]/40 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
    : "bg-[#1a1814] border border-[#2a2720] rounded-2xl p-8 max-w-4xl w-full";

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, scale: isModal ? 0.9 : 1 }}
        animate={{ opacity: 1, scale: 1 }}
        className={contentClasses}
      >
        {/* Close button - only show in modal mode */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#a7a7a7] hover:text-white"
          >
            ✕
          </button>
        )}

        {step === "upload" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#FFFFFA] text-center">Import Menu CSV</h2>

            {/* Instructions */}
            <div className="bg-[#2a2720] border border-[#3a352d] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#FFFFFA] mb-3">How to import your menu:</h3>
              <ol className="text-[#d6d6d6] space-y-2 list-decimal list-inside">
                <li>Download the CSV template below</li>
                <li>Fill in your menu items (name and price are required)</li>
                <li>Upload your completed CSV file</li>
                <li>Review and import your menu</li>
              </ol>
            </div>

            <div className="bg-[#F3C77E]/10 border border-[#F3C77E]/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F3C77E]">📋 Need a template?</h3>
                <p className="text-xs text-[#d6d6d6]">Download the CSV format guide</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-[#F3C77E] text-[#702632] rounded-lg text-sm font-medium hover:bg-[#d6a856] transition-colors"
              >
                <Download size={16} className="inline mr-2" />
                Download Template
              </button>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                ? "border-[#F3C77E] bg-[#F3C77E]/10 scale-105"
                : "border-[#2a2720] hover:border-[#F3C77E] hover:bg-[#F3C77E]/5"
                }`}
            >
              <input {...getInputProps()} />
              {loading ? (
                <Loader2 className="animate-spin text-[#F3C77E] mx-auto mb-4" size={48} />
              ) : (
                <Upload className={`mx-auto mb-4 ${isDragActive ? 'text-[#F3C77E]' : 'text-[#d6d6d6]'}`} size={48} />
              )}
              <p className={`text-lg font-medium ${isDragActive ? 'text-[#F3C77E]' : 'text-[#FFFFFA]'}`}>
                {isDragActive ? "Drop your CSV here" : "Click or drag CSV to upload"}
              </p>
              <p className="text-sm text-[#d6d6d6] mt-2">
                Required: name, price • Optional: description, category, emoji
              </p>
              <p className="text-xs text-[#a7a7a7] mt-1">
                Maximum file size: 5MB
              </p>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-400/40 rounded-xl p-4">
                <div className="flex gap-2 mb-2 text-red-400 font-medium">
                  <AlertCircle size={16} />
                  Import Errors
                </div>
                <ul className="text-sm text-red-300 space-y-1">
                  {errors.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#FFFFFA]">Preview Import</h2>
            <p className="text-[#d6d6d6]">Found {parsedItems.length} items ready to import</p>

            <div className="bg-[#2a2720] border border-[#3a352d] rounded-xl p-4">
              <div className="max-h-72 overflow-y-auto space-y-2">
                {parsedItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-[#1a1814] border border-[#3a352d] p-3 rounded-lg hover:bg-[#2a2720] transition-colors"
                  >
                    <div className="flex gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <h4 className="text-[#FFFFFA] font-medium">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs text-[#d6d6d6] mt-1">{item.description}</p>
                        )}
                        <p className="text-xs text-[#a7a7a7]">{item.category}</p>
                      </div>
                    </div>
                    <span className="text-[#F3C77E] font-bold text-lg">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStep("upload")}
                className="px-6 py-3 border border-[#2a2720] text-[#d6d6d6] rounded-xl hover:border-[#F3C77E] hover:text-[#FFFFFA] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#702632] rounded-xl font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin inline mr-2" size={16} />
                    Importing...
                  </>
                ) : (
                  `Import ${parsedItems.length} Items`
                )}
              </button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="text-center py-12">
            <CheckCircle className="text-green-400 mx-auto mb-6" size={64} />
            <h2 className="text-3xl font-bold text-[#FFFFFA] mb-3">Import Complete! 🎉</h2>
            <p className="text-[#d6d6d6] text-lg mb-2">Your menu was created successfully</p>
            <p className="text-[#a7a7a7] text-sm mb-8">
              {parsedItems.length} menu items have been imported and are ready to use
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setStep("upload");
                  setParsedItems([]);
                  setErrors([]);
                }}
                className="px-6 py-3 border border-[#2a2720] text-[#d6d6d6] rounded-xl hover:border-[#F3C77E] hover:text-[#FFFFFA] transition-colors"
              >
                Import Another Menu
              </button>
              {isModal && onClose ? (
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#702632] rounded-xl font-medium hover:scale-105 transition-all"
                >
                  Continue to Menu Editor
                </button>
              ) : (
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#702632] rounded-xl font-medium hover:scale-105 inline-block transition-all"
                >
                  Back to Dashboard
                </a>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
