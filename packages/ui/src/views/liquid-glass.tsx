"use client";

import { useRef, useState } from "react";
import {
  LiquidGlass,
  type LiquidGlassSurface,
} from "../components/ui/liquid-glass";

const SURFACES: { value: LiquidGlassSurface; label: string }[] = [
  { value: "convex-squircle", label: "Convex Squircle" },
  { value: "convex-circle", label: "Convex Circle" },
  { value: "concave", label: "Concave" },
  { value: "lip", label: "Lip" },
];

export default function LiquidGlassView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 60, y: 40 });
  const [surface, setSurface] = useState<LiquidGlassSurface>("convex-squircle");
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const GLASS_SIZE = 90;

  function onMouseDown(e: React.MouseEvent) {
    if (!containerRef.current) return;
    dragging.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left - pos.x,
      y: e.clientY - rect.top - pos.y,
    };
    e.preventDefault();
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos({
      x: Math.max(
        0,
        Math.min(
          e.clientX - rect.left - offset.current.x,
          rect.width - GLASS_SIZE,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          e.clientY - rect.top - offset.current.y,
          rect.height - GLASS_SIZE,
        ),
      ),
    });
  }

  function onMouseUp() {
    dragging.current = false;
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 h-full w-full items-center justify-center min-h-60 max-md:h-40 max-lg:min-h-40 border-neutral-800 rounded-2xl relative overflow-hidden select-none shadow-layered"
      style={{
        background: `
          radial-gradient(ellipse 130% 70% at 8% 20%, rgba(64,64,64,0.55) 0%, transparent 58%),
          radial-gradient(ellipse 80% 140% at 92% 75%, rgba(234,88,12,0.1) 0%, transparent 48%),
          radial-gradient(ellipse 110% 55% at 48% 92%, rgba(48,48,48,0.6) 0%, transparent 54%),
          radial-gradient(ellipse 65% 115% at 78% 12%, rgba(28,28,28,0.75) 0%, transparent 50%),
          radial-gradient(ellipse 90% 100% at 22% 68%, rgba(52,52,52,0.5) 0%, transparent 56%),
          radial-gradient(ellipse 55% 120% at 58% 38%, rgba(42,42,42,0.58) 0%, transparent 46%),
          radial-gradient(ellipse 100% 75% at 88% 88%, rgba(234,88,12,0.055) 0%, transparent 42%),
          radial-gradient(ellipse 75% 90% at 15% 50%, rgba(35,35,35,0.48) 0%, transparent 52%),
          linear-gradient(145deg, #0e0e0e 0%, #121212 30%, #181818 55%, #0f0f0f 85%, #0c0c0c 100%)
        `,
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <span className="flex items-center justify-center text-sm font-[460] border-neutral-600 border-2 p-2  text-neutral-500">
        Drag the glass to see the distortion
      </span>

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
        {SURFACES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSurface(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shadow-layered transition-colors ${
              surface === s.value
                ? "bg-neutral-700/60 text-white shadow-layered"
                : "bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 shadow-layered"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <LiquidGlass
        surface={surface}
        onMouseDown={onMouseDown}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: 90,
          height: 90,
          borderRadius: 120,
          cursor: "pointer",
        }}
      />
    </div>
  );
}
