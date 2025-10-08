import React, { useEffect, useRef, useState } from "react";

/**
 * MenuEditor
 * - Validates: name required, price numeric (optional)
 * - Auto-resizes description textarea
 * - Uses a <form onSubmit> with e.preventDefault() so Enter works and no reloads
 * - Calls setMenuItems from parent and optional onAdded() for toasts
 */
export default function MenuEditor({ menuItems, setMenuItems, onAdded }) {
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    emoji: "",
  });
  const [error, setError] = useState("");
  const descRef = useRef(null);

  // Auto-resize the description field
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [draft.description]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((d) => ({ ...d, [name]: value }));
    if (error) setError("");
  };

  const addItem = () => {
    // Basic validation
    if (!draft.name.trim()) {
      setError("Item name is required.");
      return;
    }
    if (draft.price !== "" && isNaN(Number(draft.price))) {
      setError("Price must be a number.");
      return;
    }

    const newItem = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: draft.price === "" ? "" : Number(draft.price),
      category: draft.category.trim(),
      emoji: draft.emoji.trim(),
      sort_order: menuItems.length,
    };

    setMenuItems((prev) => [...prev, newItem]);

    // reset fields
    setDraft({ name: "", description: "", price: "", category: "", emoji: "" });
    setError("");
    if (descRef.current) descRef.current.style.height = "40px";
    onAdded?.();
  };

  /** Handle form submit so Enter adds the item without reloading the page */
  const handleSubmit = (e) => {
    e.preventDefault();
    addItem();
  };

  const removeItem = (idx) => {
    setMenuItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          value={draft.name}
          onChange={handleChange}
          placeholder="Item name"
          className="w-full rounded-lg px-3 py-2 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/30"
        />
        <input
          type="text"
          name="price"
          value={draft.price}
          onChange={handleChange}
          placeholder="Price (e.g. 8.99)"
          className="w-full rounded-lg px-3 py-2 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/30"
        />
        <input
          type="text"
          name="category"
          value={draft.category}
          onChange={handleChange}
          placeholder="Category"
          className="w-full rounded-lg px-3 py-2 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/30"
        />
        <input
          type="text"
          name="emoji"
          value={draft.emoji}
          onChange={handleChange}
          placeholder="Emoji (optional) 🍔"
          className="w-full rounded-lg px-3 py-2 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/30"
        />

        <div className="md:col-span-2">
          <textarea
            ref={descRef}
            name="description"
            value={draft.description}
            onChange={handleChange}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-lg px-3 py-2 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/30 resize-none"
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-between">
          {error ? (
            <span className="text-xs text-[#ffb3b3]">{error}</span>
          ) : (
            <span className="text-xs text-[#a7a7a7]">
              Tip: You can leave price blank for “market price”.
            </span>
          )}
          {/* submit keeps Enter-to-add behavior */}
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#23a34b] hover:bg-[#1e8d41] text-white font-medium transition"
          >
            Add Item
          </button>
        </div>
      </form>

      {/* List */}
      {menuItems.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-[#a7a7a7]">Items ({menuItems.length})</div>

          <ul className="space-y-2">
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-3 rounded-lg border border-[#40434E]/40 bg-[#171613] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {item.emoji && <span className="text-lg">{item.emoji}</span>}
                    <span className="font-medium">{item.name}</span>
                    {item.category && (
                      <span className="ml-2 text-[11px] px-2 py-[2px] rounded-full border border-[#40434E]/50 text-[#d6d6d6]">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-xs text-[#a7a7a7] mt-1 line-clamp-2">
                      {item.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm">
                    {item.price === "" || item.price === null || isNaN(item.price)
                      ? "—"
                      : `$${Number(item.price).toFixed(2)}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-[#ffb3b3] hover:text-white text-xs underline underline-offset-4"
                    title="Delete item"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
