# Rank UI Component Reference

Detailed specifications and usage guidelines for each Rank UI component.

---

## 1. Radial Menu (`@rank/radial-menu`)

- **Description:** Context menu that fans items in a radial arc around a trigger element with spring physics and keyboard/click navigation.
- **Registry JSON:** `https://ui.rankjay.com/r/radial-menu.json`
- **Live Markdown:** `https://ui.rankjay.com/docs/radial-menu.md`
- **Dependencies:** `motion`, `lucide-react`, `clsx`, `tailwind-merge`

### Install

```bash
npx shadcn@latest add @rank/radial-menu
```

### Usage Example

```tsx
import RadialMenu from "@/registry/rank/ui/radial-menu";
import { Copy, Share2, Trash2, Edit3 } from "lucide-react";
import { useRef, useState } from "react";

export function Example() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    { id: "edit", label: "Edit", icon: Edit3, onClick: () => console.log("Edit") },
    { id: "copy", label: "Copy", icon: Copy, onClick: () => console.log("Copy") },
    { id: "share", label: "Share", icon: Share2, onClick: () => console.log("Share") },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => console.log("Delete") },
  ];

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-primary px-4 py-2 text-primary-foreground"
      >
        Open Radial Menu
      </button>

      <RadialMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        triggerRef={triggerRef}
      />
    </div>
  );
}
```

---

## 2. AI Orb (`@rank/ai-orb`)

- **Description:** Animated mesh-gradient orb powered by WebGL/Canvas shaders with audio pitch responsiveness for voice assistant interfaces.
- **Registry JSON:** `https://ui.rankjay.com/r/ai-orb.json`
- **Live Markdown:** `https://ui.rankjay.com/docs/ai-orb.md`
- **Dependencies:** `@paper-design/shaders-react`, `motion`
- **Included Hooks:** `use-audio-pitch`

### Install

```bash
npx shadcn@latest add @rank/ai-orb
```

### Usage Example

```tsx
import { AIOrb } from "@/registry/rank/ui/ai-orb";
import { useAudioPitch } from "@/registry/rank/hooks/use-audio-pitch";

export function VoiceAssistantOrb() {
  const { pitch, isListening, startListening, stopListening } = useAudioPitch();

  return (
    <div className="flex flex-col items-center gap-4">
      <AIOrb speed={isListening ? 1.0 + pitch * 2 : 0.4} color="#8B5CF6" size={280} />
      <button
        onClick={isListening ? stopListening : startListening}
        className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium"
      >
        {isListening ? "Stop Listening" : "Start Voice Assistant"}
      </button>
    </div>
  );
}
```

---

## 3. Liquid Glass (`@rank/liquid-glass`)

- **Description:** Realistic refractive glass surface with dynamic SVG distortion filters, specular highlights, and backdrop blur.
- **Registry JSON:** `https://ui.rankjay.com/r/liquid-glass.json`
- **Live Markdown:** `https://ui.rankjay.com/docs/liquid-glass.md`
- **Dependencies:** `clsx`, `tailwind-merge`

### Install

```bash
npx shadcn@latest add @rank/liquid-glass
```

### Usage Example

```tsx
import { LiquidGlass } from "@/registry/rank/ui/liquid-glass";

export function GlassCard() {
  return (
    <div className="relative flex min-h-[300px] items-center justify-center bg-gradient-to-tr from-violet-600 to-indigo-900 p-8">
      <LiquidGlass
        refraction={0.6}
        blur={16}
        className="max-w-md rounded-2xl p-6 text-white shadow-2xl"
      >
        <h3 className="text-xl font-bold">Refractive Glass</h3>
        <p className="mt-2 text-white/80 text-sm">
          Dynamic SVG filter distortion overlaying rich background colors and gradients.
        </p>
      </LiquidGlass>
    </div>
  );
}
```
