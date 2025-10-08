import React from "react";

export function LogoIcon({ className = "h-8 w-8" }) {
  return (
    <div
      className={`${className} flex items-center justify-center rounded-xl bg-wine text-gold font-bold`}
    >
      SD
    </div>
  );
}

export function LogoWithText({ className = "h-6" }) {
  return (
    <div className="flex items-center gap-2">
      <LogoIcon className="h-8 w-8" />
      <span className="text-xl font-bold text-[#F3C77E]">Scandish</span>
    </div>
  );
}
