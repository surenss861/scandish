import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function MiniQR() {
  // simple "QR-ish" pattern (no libs)
  const cells = useMemo(() => {
    const size = 13;
    const set = new Set();
    const addFinder = (ox, oy) => {
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const edge = x === 0 || y === 0 || x === 4 || y === 4;
          const inner = x === 2 && y === 2;
          if (edge || inner) set.add(`${ox + x},${oy + y}`);
        }
      }
    };
    addFinder(0, 0);
    addFinder(size - 5, 0);
    addFinder(0, size - 5);

    // sprinkle deterministic noise
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const key = `${x},${y}`;
        if (set.has(key)) continue;
        const v = (x * 17 + y * 31) % 11;
        if (v === 0 || v === 3) set.add(key);
      }
    }
    return { size, set };
  }, []);

  return (
    <div className="rounded-xl bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${cells.size}, 1fr)`,
          width: 92,
          height: 92,
        }}
      >
        {Array.from({ length: cells.size * cells.size }).map((_, i) => {
          const x = i % cells.size;
          const y = Math.floor(i / cells.size);
          const on = cells.set.has(`${x},${y}`);
          return (
            <div
              key={i}
              className={on ? "bg-black" : "bg-white"}
              style={{ width: "100%", height: "100%" }}
            />
          );
        })}
      </div>
      <div className="mt-2 text-center text-[10px] font-semibold text-[#0B0F0E]/70">
        QR unchanged
      </div>
    </div>
  );
}

export default function PhoneDemoUI() {
  const [mode, setMode] = useState("customer"); // customer | editor | syncing | live
  const [price, setPrice] = useState(16.99);
  const [draft, setDraft] = useState(16.99);

  const items = [
    { name: "Margherita Pizza", price: mode === "customer" ? 16.99 : price },
    { name: "Caesar Salad", price: 12.99 },
    { name: "Pasta Carbonara", price: 18.99 },
  ];

  const goEditor = () => {
    setDraft(price);
    setMode("editor");
  };

  const publish = async () => {
    setMode("syncing");
    // fake "sync"
    await new Promise((r) => setTimeout(r, 900));
    setPrice(draft);
    setMode("live");
    // return to customer after a moment (optional)
    await new Promise((r) => setTimeout(r, 1200));
    setMode("customer");
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.2rem] bg-[#0B0F0E] text-[#F3F5F4]">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-[#1B2420] bg-[#101614] px-4 py-3">
        <div className="text-sm font-semibold">Demo Restaurant</div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#1B2420] bg-[#0B0F0E]/60 px-2 py-1 text-[10px] font-semibold text-[#A6B0AA]">
            QR stays same
          </span>

          <AnimatePresence>
            {mode === "live" && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="rounded-full bg-[#1E7A4A] px-2 py-1 text-[10px] font-bold"
              >
                Live
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* content */}
      <div className="p-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#A6B0AA]">
          Pizza
        </div>

        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.name}
              className="rounded-xl border border-[#1B2420] bg-[#101614] px-3 py-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{it.name}</div>
                <div className="text-sm font-bold text-[#1E7A4A]">
                  ${it.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === "customer" && (
            <motion.div
              key="customer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4"
            >
              <button
                onClick={goEditor}
                className="w-full rounded-xl bg-[#1E7A4A] py-3 text-sm font-bold text-[#F3F5F4] hover:bg-[#2AAE67] transition"
              >
                Edit menu (demo)
              </button>
              <div className="mt-2 text-center text-[11px] text-[#A6B0AA]">
                "Update in seconds" — try it.
              </div>
            </motion.div>
          )}

          {mode === "editor" && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 rounded-2xl border border-[#1B2420] bg-[#0B0F0E]/60 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-bold">Editor</div>
                <div className="text-[11px] font-semibold text-[#A6B0AA]">
                  Draft
                </div>
              </div>

              <div className="text-[12px] text-[#A6B0AA] mb-3">
                Change one price, then publish.
              </div>

              <div className="rounded-xl border border-[#1B2420] bg-[#101614] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Margherita Pizza</div>
                  <div className="text-sm font-bold text-[#F3F5F4]">
                    ${draft.toFixed(2)}
                  </div>
                </div>

                <input
                  className="mt-3 w-full accent-[#1E7A4A]"
                  type="range"
                  min={12}
                  max={22}
                  step={0.5}
                  value={draft}
                  onChange={(e) => setDraft(Number(e.target.value))}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setMode("customer")}
                  className="flex-1 rounded-xl border border-[#1B2420] bg-[#101614] py-3 text-sm font-bold text-[#A6B0AA] hover:text-[#F3F5F4] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={publish}
                  className="flex-1 rounded-xl bg-[#1E7A4A] py-3 text-sm font-bold hover:bg-[#2AAE67] transition"
                >
                  Publish
                </button>
              </div>
            </motion.div>
          )}

          {mode === "syncing" && (
            <motion.div
              key="syncing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4"
            >
              <div className="rounded-2xl border border-[#1B2420] bg-[#101614] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">Publishing…</div>
                  <div className="text-[11px] font-semibold text-[#A6B0AA]">
                    Syncing
                  </div>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#0B0F0E]">
                  <motion.div
                    className="h-full bg-[#1E7A4A]"
                    initial={{ width: "10%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>

                <div className="mt-2 text-[11px] text-[#A6B0AA]">
                  Customers see updates instantly.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom-right QR "sticker" */}
      <div className="pointer-events-none absolute bottom-3 right-3 scale-[0.92]">
        <MiniQR />
      </div>

      {/* Sync toast (when live) */}
      <AnimatePresence>
        {mode === "live" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 rounded-xl border border-[#1B2420] bg-[#0B0F0E]/80 px-4 py-3 text-[12px] text-[#F3F5F4] shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            ✅ Live update published — QR code unchanged.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
