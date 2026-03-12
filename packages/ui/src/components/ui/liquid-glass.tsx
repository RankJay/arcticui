"use client";

import * as React from "react";

const RADIUS_SAMPLES = 127;
const N1 = 1;
const N2 = 1.5;
const DELTA = 0.0001;

export type LiquidGlassSurface =
  | "convex-circle"
  | "convex-squircle"
  | "concave"
  | "lip";

function vecLength(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): number {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return (
    Math.min(Math.max(qx, qy), 0) +
    vecLength(Math.max(qx, 0), Math.max(qy, 0)) -
    radius
  );
}

function sdfGradient(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): { x: number; y: number } {
  const d = roundedRectSDF(x, y, width, height, radius);
  const dx = (roundedRectSDF(x + DELTA, y, width, height, radius) - d) / DELTA;
  const dy = (roundedRectSDF(x, y + DELTA, width, height, radius) - d) / DELTA;
  const len = vecLength(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function smootherstep(s: number): number {
  const t = Math.max(0, Math.min(1, s));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// x: 0 = outer edge, 1 = inner edge (flat). Returns height of surface.
function surfaceHeight(x: number, type: LiquidGlassSurface): number {
  const t = Math.max(0, Math.min(1, x));
  const convexCircle = () => Math.sqrt(1 - (1 - t) ** 2);
  const convexSquircle = () => (1 - (1 - t) ** 4) ** 0.25;
  const convex = type === "convex-squircle" ? convexSquircle : convexCircle;

  switch (type) {
    case "convex-circle":
    case "convex-squircle":
      return convex();
    case "concave":
      return 1 - convex();
    case "lip":
      return (
        (1 - smootherstep(t)) * convex() + smootherstep(t) * (1 - convex())
      );
    default: {
      const _: never = type;
      void _;
      return convex();
    }
  }
}

// Ray trace: ray from (x, 0) going up hits surface at (x, f(x)), refracts.
// Returns displacement (signed: positive = ray lands further out from center).
function traceRay(x: number, surfaceType: LiquidGlassSurface): number {
  const y = surfaceHeight(x, surfaceType);
  const y2 = surfaceHeight(x + DELTA, surfaceType);
  const y1 = surfaceHeight(x - DELTA, surfaceType);
  const derivative = (y2 - y1) / (2 * DELTA);
  const nx = -derivative;
  const ny = 1;
  const nlen = vecLength(nx, ny) || 1;
  const nrmX = nx / nlen;
  const nrmY = ny / nlen;

  const incidentX = 0;
  const incidentY = 1;
  const cosI = incidentX * nrmX + incidentY * nrmY;
  const eta = N1 / N2;
  const sinT2 = eta * eta * (1 - cosI * cosI);
  if (sinT2 >= 1) return 0;

  const cosT = Math.sqrt(1 - sinT2);
  const refractedX = eta * incidentX + (eta * cosI - cosT) * nrmX;
  const refractedY = eta * incidentY + (eta * cosI - cosT) * nrmY;

  const t = -y / refractedY;
  const landingX = x + refractedX * t;
  return landingX - x;
}

function precomputeDisplacements(
  surfaceType: LiquidGlassSurface,
): Float32Array {
  const out = new Float32Array(RADIUS_SAMPLES + 1);
  for (let i = 0; i <= RADIUS_SAMPLES; i++) {
    const x = i / RADIUS_SAMPLES;
    out[i] = traceRay(x, surfaceType);
  }
  return out;
}

function buildPhysicsDisplacementMap(
  width: number,
  height: number,
  surfaceType: LiquidGlassSurface,
  bezelWidth: number,
  glassThickness: number,
  scaleRatio: number,
): { dataUrl: string; scale: number } {
  const displacements = precomputeDisplacements(surfaceType);
  const maxMag = Math.max(...Array.from(displacements).map(Math.abs), 0.001);

  const aspect = width / height;
  const sdfW = 1;
  const sdfH = 1 / Math.max(aspect, 0.5);
  const sdfR = Math.min(sdfW, sdfH) * 0.4;

  const pixelBezel = Math.min(width, height) * bezelWidth;
  const pixelScale =
    (Math.min(width, height) * 0.15 * glassThickness * scaleRatio) / maxMag;

  const rawDx = new Float32Array(width * height);
  const rawDy = new Float32Array(width * height);

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const u = px / width;
      const v = py / height;
      const ix = (u - 0.5) * 2;
      const iy = ((v - 0.5) * 2) / Math.max(aspect, 0.5);
      const d = roundedRectSDF(ix, iy, sdfW, sdfH, sdfR);

      let dx = 0;
      let dy = 0;

      if (d < 0) {
        const depth = -d;
        const pixDepth = depth * Math.min(width, height) * 0.5;
        if (pixDepth <= pixelBezel) {
          const t = pixDepth / pixelBezel;
          const idx = Math.min(
            Math.floor(t * RADIUS_SAMPLES),
            RADIUS_SAMPLES - 1,
          );
          const frac = t * RADIUS_SAMPLES - idx;
          const mag =
            displacements[idx]! * (1 - frac) + displacements[idx + 1]! * frac;
          const normMag = (-mag / maxMag) * glassThickness * scaleRatio;
          const grad = sdfGradient(ix, iy, sdfW, sdfH, sdfR);
          dx = grad.x * normMag * pixelScale;
          dy = grad.y * normMag * pixelScale;
        }
      }

      const idx = py * width + px;
      rawDx[idx] = dx;
      rawDy[idx] = dy;
    }
  }

  const maxD = Math.max(
    ...Array.from(rawDx).map(Math.abs),
    ...Array.from(rawDy).map(Math.abs),
    0.001,
  );
  const scale = Math.min(maxD, 127);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const dx = rawDx[i]! / scale;
    const dy = rawDy[i]! / scale;
    data[i * 4] = Math.round(128 + Math.max(-1, Math.min(1, dx)) * 127);
    data[i * 4 + 1] = Math.round(128 + Math.max(-1, Math.min(1, dy)) * 127);
    data[i * 4 + 2] = 128;
    data[i * 4 + 3] = 255;
  }

  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  return { dataUrl: canvas.toDataURL(), scale };
}

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: LiquidGlassSurface;
  bezelWidth?: number;
  glassThickness?: number;
  scaleRatio?: number;
  chromaticStrength?: number;
  /** 0 = off, ~0.2–0.35 = subtle internal reflection ghost. Adds depth. */
  doubleRefractionStrength?: number;
}

export const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassProps>(
  (
    {
      surface = "convex-squircle",
      bezelWidth = 0.12,
      glassThickness = 1,
      scaleRatio = 1,
      chromaticStrength = 1.5,
      doubleRefractionStrength = 0.25,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current!);

    const filterId = React.useId().replace(/:/g, "");
    const feImageRef = React.useRef<SVGFEImageElement>(null);
    const feDispRef = React.useRef<SVGFEDisplacementMapElement>(null);
    const feDispRRef = React.useRef<SVGFEDisplacementMapElement>(null);
    const feDispBRef = React.useRef<SVGFEDisplacementMapElement>(null);
    const feDispInternalRef = React.useRef<SVGFEDisplacementMapElement>(null);
    const filterRef = React.useRef<SVGFilterElement>(null);

    React.useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      const sync = () => {
        const { width, height } = el.getBoundingClientRect();
        const w = Math.round(width);
        const h = Math.round(height);
        if (!w || !h) return;

        if (filterRef.current) {
          filterRef.current.setAttribute("width", String(w));
          filterRef.current.setAttribute("height", String(h));
        }
        if (feImageRef.current) {
          feImageRef.current.setAttribute("width", String(w));
          feImageRef.current.setAttribute("height", String(h));
        }
        if (feImageRef.current && feDispRef.current) {
          const { dataUrl, scale } = buildPhysicsDisplacementMap(
            w,
            h,
            surface,
            bezelWidth,
            glassThickness,
            scaleRatio,
          );
          feImageRef.current.setAttributeNS(
            "http://www.w3.org/1999/xlink",
            "href",
            dataUrl,
          );
          feDispRef.current.setAttribute("scale", String(scale));
          if (feDispRRef.current && feDispBRef.current) {
            const c = Math.min(Math.max(0, chromaticStrength), 5);
            feDispRRef.current.setAttribute("scale", String(-c));
            feDispBRef.current.setAttribute("scale", String(c));
          }
          if (feDispInternalRef.current) {
            const s = Math.min(Math.max(0, doubleRefractionStrength), 0.5);
            feDispInternalRef.current.setAttribute("scale", String(-scale * s));
          }
        }
      };

      sync();
      const ro = new ResizeObserver(sync);
      ro.observe(el);
      return () => ro.disconnect();
    }, [
      surface,
      bezelWidth,
      glassThickness,
      scaleRatio,
      chromaticStrength,
      doubleRefractionStrength,
    ]);

    return (
      <>
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width={0}
          height={0}
          style={{ position: "absolute", pointerEvents: "none" }}
        >
          <defs>
            <filter
              ref={filterRef}
              id={filterId}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
              x="0"
              y="0"
            >
              <feImage ref={feImageRef} result="displacementMap" />
              <feDisplacementMap
                ref={feDispRef}
                in="SourceGraphic"
                in2="displacementMap"
                xChannelSelector="R"
                yChannelSelector="G"
                result="refracted"
              />
              <feDisplacementMap
                ref={feDispInternalRef}
                in="SourceGraphic"
                in2="displacementMap"
                xChannelSelector="R"
                yChannelSelector="G"
                result="ghostRefracted"
              />
              <feComponentTransfer in="refracted" result="rChannel">
                <feFuncR type="identity" />
                <feFuncG type="table" tableValues="0" />
                <feFuncB type="table" tableValues="0" />
                <feFuncA type="identity" />
              </feComponentTransfer>
              <feComponentTransfer in="refracted" result="gChannel">
                <feFuncR type="table" tableValues="0" />
                <feFuncG type="identity" />
                <feFuncB type="table" tableValues="0" />
                <feFuncA type="identity" />
              </feComponentTransfer>
              <feComponentTransfer in="refracted" result="bChannel">
                <feFuncR type="table" tableValues="0" />
                <feFuncG type="table" tableValues="0" />
                <feFuncB type="identity" />
                <feFuncA type="identity" />
              </feComponentTransfer>
              <feDisplacementMap
                ref={feDispRRef}
                in="rChannel"
                in2="displacementMap"
                xChannelSelector="R"
                yChannelSelector="G"
                result="rDisp"
              />
              <feDisplacementMap
                ref={feDispBRef}
                in="bChannel"
                in2="displacementMap"
                xChannelSelector="R"
                yChannelSelector="G"
                result="bDisp"
              />
              <feComposite
                in="rDisp"
                in2="gChannel"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
                result="rg"
              />
              <feComposite
                in="rg"
                in2="bDisp"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
                result="primary"
              />
              <feColorMatrix
                in="ghostRefracted"
                result="ghostFaded"
                type="matrix"
                values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.2 0"
              />
              <feBlend in="primary" in2="ghostFaded" mode="normal" />
            </filter>
          </defs>
        </svg>

        <div
          ref={innerRef}
          className={className}
          style={{
            position: "relative",
            overflow: "hidden",
            backdropFilter: `url(#${filterId}) blur(0.25px) brightness(1.05) saturate(1.1)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(0.25px) brightness(1.05) saturate(1.1)`,
            ...style,
          }}
          {...props}
        >
          {/* 1. Edge darkening (ambient occlusion) - darker at rim */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 42%, rgba(0,0,0,0.08) 52%, rgba(0,0,0,0.04) 100%)",
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />
          {/* 3. Environment reflection - very subtle linear wash, no defined shape */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(165deg, rgba(255,255,255,0.0006) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.0005) 100%), linear-gradient(255deg, transparent 0%, rgba(255,255,255,0.0004) 45%, transparent 75%), linear-gradient(75deg, transparent 0%, rgba(0,0,0,0.0004) 55%, transparent 100%)",
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />
          {/* 2. Fresnel - more reflection at grazing angles (edges) */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(255,255,255,0.02) 65%, rgba(255,255,255,0.05) 100%)",
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />
          {/* 4. Specular highlight - rim light from top-left */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              border: "1.38px solid transparent",
              backgroundImage:
                "linear-gradient(160deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.28) 12%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.0) 65%, rgba(255,255,255,0.05) 100%)",
              backgroundOrigin: "border-box",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
            }}
          />
          {/* 5. Specular hot spot - blurred for soft diffusion */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 140% 110% at 28% 22%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 40%, transparent 65%)",
              filter: "blur(10px)",
              transform: "scale(1.06)",
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              height: "100%",
            }}
          >
            {children}
          </div>
        </div>
      </>
    );
  },
);

LiquidGlass.displayName = "LiquidGlass";
