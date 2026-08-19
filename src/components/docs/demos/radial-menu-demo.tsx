"use client";

import RadialMenu from "@/registry/rank/ui/radial-menu";
import { Copy, Pencil, Share2, Trash2 } from "lucide-react";
import { useRef } from "react";

const items = [
  { id: "edit", label: "Edit", icon: Pencil },
  { id: "copy", label: "Copy", icon: Copy },
  { id: "share", label: "Share", icon: Share2 },
  { id: "delete", label: "Delete", icon: Trash2 },
];

export function RadialMenuDemo() {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        ref={triggerRef}
        type="button"
        className="border-border bg-background hover:bg-muted rounded-full border px-5 py-2.5 text-sm font-medium shadow-sm transition-colors"
      >
        Press and hold
      </button>
      <RadialMenu
        items={items}
        triggerRef={triggerRef}
        onSelect={() => {
          /* demo */
        }}
      />
      <p className="text-muted-foreground max-w-xs text-center text-xs">
        Click and hold the button, then move the cursor to select an action.
      </p>
    </div>
  );
}
