"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

// ==================== Type Definitions ====================

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface RadialMenuProps {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

interface Position {
  x: number;
  y: number;
}

interface ArcSegmentAngles {
  startAngle: number;
  endAngle: number;
  midAngle: number;
}

interface PreCalculatedSegment {
  segmentPath: string;
  outerRingPath: string;
  labelPosition: Position;
}

// ==================== Constants ====================

/** Arc geometry configuration - defines the circular menu shape */
const ARC_CONFIG = {
  /** Outer radius of the menu ring in pixels */
  RADIUS: 120,
  /** Width of the interactive ring area */
  RING_WIDTH: 70,
  /** Starting angle in degrees (left side) */
  START_ANGLE: -180,
  /** Ending angle in degrees (right side) */
  END_ANGLE: 180,
  /** Total arc span in degrees */
  get TOTAL_ARC() {
    return this.END_ANGLE - this.START_ANGLE;
  },
} as const;

/** Spacing and padding dimensions */
const DIMENSIONS = {
  /** Extra space around the SVG viewBox for outer ring */
  OUTER_PADDING: 20,
  /** Thickness of the outer ring indicator */
  OUTER_RING_WIDTH: 8,
  /** Distance of outer ring from main radius */
  OUTER_RING_OFFSET: 10,
  /** Additional tolerance for hover detection beyond outer radius */
  HOVER_TOLERANCE: 20,
  /** Gap angle between segments in degrees */
  SEGMENT_GAP: 10,
  /** Size of the icon container */
  ICON_SIZE: 32,
  /** Half of icon size for centering calculations */
  ICON_HALF_SIZE: 16,
  /** Size of the icon itself */
  ICON_RENDER_SIZE: 18,
  /** Radius of center cursor indicator */
  CENTER_DOT_OUTER: 4,
  /** Radius of center cursor indicator inner dot */
  CENTER_DOT_INNER: 2,
  /** Offset for floating inner ring */
  INNER_RING_OFFSET: 6,
  /** Width of floating inner ring stroke */
  INNER_RING_STROKE: 2,
} as const;

/** Color palette for the radial menu */
const COLORS = {
  /** Base segment fill color */
  SEGMENT_BASE: "#232323",
  /** Hovered segment fill color */
  SEGMENT_HOVER: "#282828",
  /** Segment border color */
  SEGMENT_STROKE: "#292929",
  /** Outer ring base color */
  OUTER_RING_BASE: "#232323",
  /** Outer ring hovered color */
  OUTER_RING_HOVER: "#646464",
  /** Floating inner ring color */
  INNER_RING: "#282828",
  /** Icon color when not hovered */
  ICON_BASE: "text-neutral-500",
  /** Icon color when hovered */
  ICON_HOVER: "text-neutral-200",
  /** Center cursor indicator outer dot */
  CENTER_DOT_OUTER: "#323232",
  /** Center cursor indicator inner dot */
  CENTER_DOT_INNER: "#232323",
} as const;

/** Optional visual effects that can be enabled */
const OPTIONAL_EFFECTS = {
  /** Enable glow effect on hovered segments */
  SEGMENT_GLOW: false,
  /** Glow effect configuration */
  GLOW: {
    FILL: "#d7d7d7",
    STROKE: "#a3a3a3",
    STROKE_WIDTH: 2,
    OPACITY: 0.3,
  },
  /** Enable blurred background in center circle */
  CENTER_BLUR: false,
  /** Center blur configuration */
  CENTER: {
    FILL: "#fafafa",
    OPACITY: 0.9,
    OVERLAY_FILL: "#262626",
    OVERLAY_OPACITY: 0.12,
  },
} as const;

/** Animation configuration for menu transitions */
const ANIMATION_CONFIG = {
  /** Menu open/close animation settings */
  MENU: {
    INITIAL: { opacity: 0, scale: 0.1 },
    ANIMATE: { opacity: 1, scale: 1 },
    EXIT: { opacity: 0, scale: 0.3 },
    TRANSITION: {
      type: "spring" as const,
      stiffness: 560,
      damping: 35,
      mass: 1,
      duration: 0.1,
    },
  },
  /** Segment hover animation duration */
  SEGMENT_TRANSITION: {
    duration: 0.15,
    ease: "easeOut" as const,
  },
  /** Optional effect animation duration */
  EFFECT_TRANSITION: {
    duration: 0.15,
  },
  /** Center circle fade-in duration */
  CENTER_FADE: {
    duration: 0.2,
  },
} as const;

// ==================== Helper Functions ====================

/**
 * Normalizes an angle to 0-360 degree range
 */
function normalizeAngle(angle: number): number {
  let normalized = angle;
  if (normalized < 0) normalized += 360;
  return normalized;
}

/**
 * Calculates the angles for a specific segment
 */
function calculateSegmentAngles(
  index: number,
  totalItems: number
): ArcSegmentAngles {
  const segmentAngle = ARC_CONFIG.TOTAL_ARC / totalItems;
  const startAngle = ARC_CONFIG.START_ANGLE + index * segmentAngle;
  const endAngle = startAngle + segmentAngle;
  const midAngle = startAngle + segmentAngle / 2;

  return { startAngle, endAngle, midAngle };
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates position on a circle given angle and radius
 */
function getCirclePoint(angleInDegrees: number, radius: number): Position {
  const rad = toRadians(angleInDegrees);
  return {
    x: radius * Math.cos(rad),
    y: radius * Math.sin(rad),
  };
}

// ==================== Component ====================

export default function RadialMenu({
  items,
  onSelect,
  triggerRef,
}: RadialMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<Position>({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Use refs to avoid recreating event handlers on every render
  const menuPositionRef = useRef<Position>({ x: 0, y: 0 });
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);

  // Keep refs up to date
  useEffect(() => {
    menuPositionRef.current = menuPosition;
    itemsRef.current = items;
    onSelectRef.current = onSelect;
  });

  /**
   * Pre-calculate all segment paths and positions (memoized)
   * Only recalculates when number of items changes
   */
  const precalculatedSegments = useMemo<PreCalculatedSegment[]>(() => {
    return Array.from({ length: items.length }, (_, index) => {
      const { startAngle, endAngle, midAngle } = calculateSegmentAngles(
        index,
        items.length
      );

      /**
       * Build the SVG path for a donut segment with visual gaps between items.
       * We create two arcs (outer and inner) and connect them to form a slice.
       * Gaps are applied by shrinking each segment from both ends.
       */
      const gapAngle = DIMENSIONS.SEGMENT_GAP;
      const adjustedStartAngle = startAngle + gapAngle;
      const adjustedEndAngle = endAngle - gapAngle;
      
      const outerStart = getCirclePoint(adjustedStartAngle, ARC_CONFIG.RADIUS);
      const outerEnd = getCirclePoint(adjustedEndAngle, ARC_CONFIG.RADIUS);
      const innerRadius = ARC_CONFIG.RADIUS - ARC_CONFIG.RING_WIDTH;
      const innerStart = getCirclePoint(adjustedStartAngle, innerRadius);
      const innerEnd = getCirclePoint(adjustedEndAngle, innerRadius);
      const segmentAngle = ARC_CONFIG.TOTAL_ARC / items.length;
      // SVG arc flag: determines if we draw the long way (1) or short way (0) around the circle
      const largeArcFlag = segmentAngle - gapAngle * 2 > 180 ? 1 : 0;

      const segmentPath = `
        M ${outerStart.x} ${outerStart.y}
        A ${ARC_CONFIG.RADIUS} ${ARC_CONFIG.RADIUS} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}
        L ${innerEnd.x} ${innerEnd.y}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}
        Z
      `;

      // Calculate outer ring path (decorative arc that sits outside the main segments)
      const outerRadius = ARC_CONFIG.RADIUS + DIMENSIONS.OUTER_RING_OFFSET;
      const startPoint = getCirclePoint(adjustedStartAngle, outerRadius);
      const endPoint = getCirclePoint(adjustedEndAngle, outerRadius);
      // SVG arc flag for the outer ring
      const outerLargeArcFlag = segmentAngle - gapAngle * 2 > 180 ? 1 : 0;

      const outerRingPath = `M ${startPoint.x} ${startPoint.y} A ${outerRadius} ${outerRadius} 0 ${outerLargeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;

      // Calculate label position
      const labelRadius = ARC_CONFIG.RADIUS - ARC_CONFIG.RING_WIDTH / 2;
      const labelPosition = getCirclePoint(midAngle, labelRadius);

      return { segmentPath, outerRingPath, labelPosition };
    });
  }, [items.length]);

  /** Opens the menu at cursor position (memoized) */
  const handleMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    setHoveredIndex(null);
    setIsOpen(true);
    const position = { x: e.clientX, y: e.clientY };
    setMenuPosition(position);
    menuPositionRef.current = position;
  }, []);

  /** Unified effect: Handle all event listeners (optimized with single useEffect) */
  useEffect(() => {
    // Attach listener to external trigger if provided
    const triggerElement = triggerRef?.current;
    if (triggerElement) {
      triggerElement.addEventListener(
        "mousedown",
        handleMouseDown as EventListener
      );
    }

    // Only add menu interaction listeners when menu is open
    if (!isOpen) {
      return () => {
        if (triggerElement) {
          triggerElement.removeEventListener(
            "mousedown",
            handleMouseDown as EventListener
          );
        }
      };
    }

    // Use local variable to track hover state without causing re-renders
    let currentHoveredIndex: number | null = null;

    /**
     * Pre-calculate constants outside event handler for performance.
     * These values don't change during interaction, so computing them once
     * avoids redundant calculations on every mouse move event.
     */
    const innerRadius = ARC_CONFIG.RADIUS - ARC_CONFIG.RING_WIDTH;
    const outerRadius = ARC_CONFIG.RADIUS;
    const normalizedStartAngle = normalizeAngle(ARC_CONFIG.START_ANGLE);

    /** Optimized mouse move handler using refs */
    const handleMouseMove = (e: MouseEvent) => {
      const pos = menuPositionRef.current;
      const deltaX = e.clientX - pos.x;
      const deltaY = e.clientY - pos.y;

      // Calculate distance from center
      const distanceFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Check if mouse is within the interactive ring area
      const isOutsideRing =
        distanceFromCenter < innerRadius ||
        distanceFromCenter > outerRadius + DIMENSIONS.HOVER_TOLERANCE;

      if (isOutsideRing) {
        if (currentHoveredIndex !== null) {
          currentHoveredIndex = null;
          setHoveredIndex(null);
        }
        return;
      }

      /**
       * Convert mouse position to an angle, then determine which segment is hovered.
       * Coordinate system: 0° is right (3 o'clock), angles increase counter-clockwise.
       * Our menu starts at -180° (left/9 o'clock) and spans 360°.
       */
      const rawAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      const angle = normalizeAngle(rawAngle);

      // Calculate which segment is hovered based on relative angle
      const currentItems = itemsRef.current;
      const segmentAngle = ARC_CONFIG.TOTAL_ARC / currentItems.length;
      let relativeAngle = angle - normalizedStartAngle;

      // Handle angle wrap-around cases (e.g., when crossing from 359° to 0°)
      if (relativeAngle < 0) relativeAngle += 360;
      if (relativeAngle >= ARC_CONFIG.TOTAL_ARC) relativeAngle -= 360;

      // Determine if cursor is within valid arc range and update hover state
      const isWithinArc =
        relativeAngle >= 0 && relativeAngle < ARC_CONFIG.TOTAL_ARC;

      if (isWithinArc) {
        const index = Math.floor(relativeAngle / segmentAngle);

        if (
          index >= 0 &&
          index < currentItems.length &&
          index !== currentHoveredIndex
        ) {
          currentHoveredIndex = index;
          setHoveredIndex(index);
        }
      } else {
        if (currentHoveredIndex !== null) {
          currentHoveredIndex = null;
          setHoveredIndex(null);
        }
      }
    };

    /** Handle menu selection on mouse release */
    const handleMouseUp = () => {
      if (
        currentHoveredIndex !== null &&
        currentHoveredIndex < itemsRef.current.length
      ) {
        onSelectRef.current(itemsRef.current[currentHoveredIndex]);
      }
      setIsOpen(false);
      setHoveredIndex(null);
    };

    /** Handle escape key to close menu */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setHoveredIndex(null);
      }
    };

    // Add all event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Clean up all listeners
      if (triggerElement) {
        triggerElement.removeEventListener(
          "mousedown",
          handleMouseDown as EventListener
        );
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, triggerRef, handleMouseDown]); // Minimal dependencies

  return (
    // Animated radial menu overlay
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={ANIMATION_CONFIG.MENU.INITIAL}
          animate={ANIMATION_CONFIG.MENU.ANIMATE}
          exit={ANIMATION_CONFIG.MENU.EXIT}
          transition={ANIMATION_CONFIG.MENU.TRANSITION}
          className="fixed pointer-events-none"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
            x: "-50%",
            y: "-50%",
          }}
        >
          <svg
            width={ARC_CONFIG.RADIUS * 2 + DIMENSIONS.OUTER_PADDING * 2}
            height={ARC_CONFIG.RADIUS * 2 + DIMENSIONS.OUTER_PADDING * 2}
            viewBox={`${-ARC_CONFIG.RADIUS - DIMENSIONS.OUTER_PADDING} ${
              -ARC_CONFIG.RADIUS - DIMENSIONS.OUTER_PADDING
            } ${ARC_CONFIG.RADIUS * 2 + DIMENSIONS.OUTER_PADDING * 2} ${
              ARC_CONFIG.RADIUS * 2 + DIMENSIONS.OUTER_PADDING * 2
            }`}
            className="overflow-visible"
          >
            {/* SVG filter definitions for optional visual effects */}
            <defs>
              {/* Radial gradient for base segment state */}
              <radialGradient 
                id="segmentGradientBase" 
                cx="0" 
                cy="0" 
                r={ARC_CONFIG.RADIUS}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#2a2a2a" />
                <stop offset="100%" stopColor="#232323" />
              </radialGradient>
              
              {/* Radial gradient for hovered segment state */}
              <radialGradient 
                id="segmentGradientHover" 
                cx="0" 
                cy="0" 
                r={ARC_CONFIG.RADIUS}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#3a3a3a" />
                <stop offset="100%" stopColor="#282828" />
              </radialGradient>
              
              {/* Glow effect filter (used when OPTIONAL_EFFECTS.SEGMENT_GLOW is enabled) */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Blur effect for center circle (used when OPTIONAL_EFFECTS.CENTER_BLUR is enabled) */}
              <filter
                id="centerBlur"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
              </filter>
            </defs>

            {/* Render each menu segment with icon (using pre-calculated data) */}
            {items.map((item, index) => {
              const isHovered = hoveredIndex === index;
              const segment = precalculatedSegments[index];

              return (
                <g key={item.id}>
                  {/* Base segment path (donut slice) */}
                  <motion.path
                    d={segment.segmentPath}
                    fill={
                      isHovered
                        ? "url(#segmentGradientHover)"
                        : "url(#segmentGradientBase)"
                    }
                    stroke={COLORS.SEGMENT_STROKE}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ opacity: 1 }}
                    animate={{
                      fill: isHovered
                        ? "url(#segmentGradientHover)"
                        : "url(#segmentGradientBase)",
                      opacity: 1,
                    }}
                    transition={ANIMATION_CONFIG.SEGMENT_TRANSITION}
                  />

                  {/* Optional: Hover overlay with glow effect (controlled by OPTIONAL_EFFECTS.SEGMENT_GLOW) */}
                  {OPTIONAL_EFFECTS.SEGMENT_GLOW && isHovered && (
                    <motion.path
                      d={segment.segmentPath}
                      fill={OPTIONAL_EFFECTS.GLOW.FILL}
                      stroke={OPTIONAL_EFFECTS.GLOW.STROKE}
                      strokeWidth={OPTIONAL_EFFECTS.GLOW.STROKE_WIDTH}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: OPTIONAL_EFFECTS.GLOW.OPACITY }}
                      transition={ANIMATION_CONFIG.EFFECT_TRANSITION}
                      style={{ filter: "url(#glow)" }}
                    />
                  )}

                  {/* Outer ring indicator (highlights on hover) */}
                  <motion.path
                    d={segment.outerRingPath}
                    fill="none"
                    stroke={
                      isHovered
                        ? COLORS.OUTER_RING_HOVER
                        : COLORS.OUTER_RING_BASE
                    }
                    strokeWidth={DIMENSIONS.OUTER_RING_WIDTH}
                    strokeLinecap="round"
                    initial={{ opacity: 0.4 }}
                    animate={{
                      stroke: isHovered
                        ? COLORS.OUTER_RING_HOVER
                        : COLORS.OUTER_RING_BASE,
                      opacity: 1,
                    }}
                    transition={ANIMATION_CONFIG.SEGMENT_TRANSITION}
                  />

                  {/* Icon container positioned at segment center */}
                  <foreignObject
                    x={segment.labelPosition.x - DIMENSIONS.ICON_HALF_SIZE}
                    y={segment.labelPosition.y - DIMENSIONS.ICON_HALF_SIZE}
                    width={DIMENSIONS.ICON_SIZE}
                    height={DIMENSIONS.ICON_SIZE}
                    style={{ overflow: "visible" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: `${DIMENSIONS.ICON_SIZE}px`,
                        height: `${DIMENSIONS.ICON_SIZE}px`,
                      }}
                    >
                      <item.icon
                        size={DIMENSIONS.ICON_RENDER_SIZE}
                        className={
                          isHovered ? COLORS.ICON_HOVER : COLORS.ICON_BASE
                        }
                      />
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            {/* Floating inner ring - decorative circle inside the segments */}
            <circle
              cx="0"
              cy="0"
              r={
                ARC_CONFIG.RADIUS -
                ARC_CONFIG.RING_WIDTH -
                DIMENSIONS.INNER_RING_OFFSET
              }
              fill="none"
              stroke={COLORS.INNER_RING}
              strokeWidth={DIMENSIONS.INNER_RING_STROKE}
              opacity="0.6"
            />

            {/* Optional: Center background circle with blur effect (controlled by OPTIONAL_EFFECTS.CENTER_BLUR) */}
            {OPTIONAL_EFFECTS.CENTER_BLUR && (
              <>
                {/* Blurred background layer */}
                <motion.circle
                  cx="0"
                  cy="0"
                  r={ARC_CONFIG.RADIUS - ARC_CONFIG.RING_WIDTH - 5}
                  fill={OPTIONAL_EFFECTS.CENTER.FILL}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: OPTIONAL_EFFECTS.CENTER.OPACITY }}
                  transition={ANIMATION_CONFIG.CENTER_FADE}
                  style={{ filter: "url(#centerBlur)" }}
                />
                {/* Dark overlay on top of blur */}
                <motion.circle
                  cx="0"
                  cy="0"
                  r={ARC_CONFIG.RADIUS - ARC_CONFIG.RING_WIDTH - 5}
                  fill={OPTIONAL_EFFECTS.CENTER.OVERLAY_FILL}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: OPTIONAL_EFFECTS.CENTER.OVERLAY_OPACITY }}
                  transition={ANIMATION_CONFIG.CENTER_FADE}
                />
              </>
            )}

            {/* Center cursor indicator (two-layer dot showing exact cursor position) */}
            <circle
              cx="0"
              cy="0"
              r={DIMENSIONS.CENTER_DOT_OUTER}
              fill={COLORS.CENTER_DOT_OUTER}
              opacity="0.9"
            />
            <circle
              cx="0"
              cy="0"
              r={DIMENSIONS.CENTER_DOT_INNER}
              fill={COLORS.CENTER_DOT_INNER}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
