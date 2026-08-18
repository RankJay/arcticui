"use client";

import { LiquidGlass } from "@/registry/rank/ui/liquid-glass";

export function LiquidGlassDemo() {
  return (
    <div className="relative flex h-[280px] w-full max-w-md items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_50%,#f093fb_100%)]">
      <LiquidGlass className="flex h-40 w-64 items-center justify-center rounded-2xl text-sm font-medium text-white/90">
        Liquid glass
      </LiquidGlass>
    </div>
  );
}
