import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhoneDemoUI() {
  const [step, setStep] = useState(0);

  return (
    <div className="h-full w-full bg-[#0B0F0E] text-[#F3F5F4] font-sans overflow-hidden rounded-[28px] border border-[#1B2420]">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between bg-[#101614] border-b border-[#1B2420]">
        <div className="text-sm font-semibold">Demo Restaurant</div>
        <div className="text-xs text-[#A6B0AA]">Live</div>
      </div>

      <div className="p-4">
        <div className="text-[11px] tracking-wider uppercase text-[#A6B0AA] mb-2">Pizza</div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
              className="space-y-3"
            >
              <Item name="Margherita Pizza" price="$16.99" />
              <Item name="Caesar Salad" price="$12.99" />
              <Item name="Pasta Carbonara" price="$18.99" />

              <button
                onClick={() => setStep(1)}
                className="mt-3 w-full rounded-xl bg-[#1E7A4A] py-3 text-sm font-semibold"
              >
                Edit price (demo)
              </button>
              <p className="mt-2 text-[12px] text-[#A6B0AA]">
                Tap to see how "update in seconds" works.
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-[#1B2420] bg-[#101614] p-4">
                <div className="text-sm font-semibold mb-2">Margherita Pizza</div>
                <div className="text-xs text-[#A6B0AA] mb-3">Change price:</div>

                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl bg-black/30 border border-[#1B2420] px-3 py-2 text-sm">
                    $14.99
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-[#1E7A4A] px-4 text-sm font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep(0)}
                className="w-full rounded-xl border border-[#1B2420] py-3 text-sm font-semibold text-[#A6B0AA]"
              >
                Back
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
              className="space-y-3"
            >
              <div className="rounded-2xl border border-[#1B2420] bg-[#101614] p-4">
                <div className="text-sm font-semibold mb-2">Updated ✅</div>
                <div className="text-xs text-[#A6B0AA]">
                  Price changed instantly. QR code stays the same.
                </div>
              </div>

              <div className="rounded-2xl border border-[#1B2420] bg-[#0B0F0E] p-4">
                <div className="text-[11px] tracking-wider uppercase text-[#A6B0AA] mb-2">Pizza</div>
                <Item name="Margherita Pizza" price="$14.99" />
              </div>

              <button
                onClick={() => setStep(0)}
                className="w-full rounded-xl bg-[#1E7A4A] py-3 text-sm font-semibold"
              >
                Replay demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Item({ name, price }) {
  return (
    <div className="rounded-xl border border-[#1B2420] bg-[#101614] px-3 py-3 flex items-center justify-between">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-sm font-semibold text-[#1E7A4A]">{price}</span>
    </div>
  );
}

