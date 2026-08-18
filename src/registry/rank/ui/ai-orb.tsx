"use client";

import { MeshGradient } from "@paper-design/shaders-react";

export interface AIOrbProps {
  speed?: number;
  colors?: string[];
  size?: number;
  className?: string;
  distortion?: number;
  swirl?: number;
  grainMixer?: number;
  grainOverlay?: number;
}

export function AIOrb({
  speed = 1,
  colors = ["#52b7ff", "#ffffff", "#0084ff", "#005eff"],
  size = 160,
  className = "size-40 rounded-full",
  distortion = 0.5,
  swirl = 1,
  grainMixer = 0.65,
  grainOverlay = 0.1,
}: AIOrbProps) {
  return (
    <MeshGradient
      colors={colors}
      width={size}
      height={size}
      distortion={distortion}
      swirl={swirl}
      grainMixer={grainMixer}
      grainOverlay={grainOverlay}
      speed={speed}
      className={className}
    />
  );
}
