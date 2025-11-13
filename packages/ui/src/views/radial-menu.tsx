"use client";

import { useRef } from "react";
import RadialMenu from "../components/ui/radial-menu";
import { Home, User, Mail } from "lucide-react";

export default function RadialMenuView() {
  const triggerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-1 items-center justify-center">
      <main
        ref={triggerRef}
        className="flex flex-1 flex-col h-full w-full max-md:h-40 max-md:min-h-40 items-center justify-center text-center bg-neutral-900/40 border-neutral-800 rounded-2xl p-2 shadow-layered"
      >
        <span className="text-sm font-[460] text-neutral-700">
          Click and hold to open the menu
        </span>
      </main>
      <RadialMenu
        items={[
          { id: "1", label: "Home", icon: Home },
          { id: "2", label: "About", icon: User },
          { id: "3", label: "Contact", icon: Mail },
        ]}
        onSelect={() => {}}
        triggerRef={triggerRef}
      />
    </div>
  );
}
