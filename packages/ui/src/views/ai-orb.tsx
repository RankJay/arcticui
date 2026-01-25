"use client";

import { AIOrb } from "../components/ui/ai-orb";

export default function AIOrbView() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-1 flex-col h-full w-full max-md:h-40 max-lg:min-h-40 items-center justify-center text-center rounded-2xl p-2">
        <AIOrb size={160} className="size-40 rounded-full" />
      </div>
    </div>
  );
}
