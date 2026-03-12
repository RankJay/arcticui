import RadialMenuView from "@repo/ui/views/radial-menu";
import HeroSection from "../views/hero";
import AIOrbView from "@repo/ui/views/ai-orb";
import LiquidGlassView from "@repo/ui/views/liquid-glass";
import {
  ComponentDescription,
  ComponentHeading,
  ComponentTag,
} from "../views/component";
import { CopyComponent } from "../views/copy-cmd";

export default function Home() {
  return (
    <div className="flex font-sans flex-col items-center justify-center h-auto w-full gap-20 max-md:gap-10 pb-10 scrollbar-none">
      <HeroSection />
      <div className="flex flex-col items-center justify-center h-auto w-full gap-56 max-md:gap-10 pb-10">
        <div className="flex w-full px-40 h-auto gap-20 max-lg:flex-col max-md:px-12">
          <div className="flex flex-col gap-2">
            <ComponentHeading>Radial Menu</ComponentHeading>
            <ComponentDescription>
              Experimenting a menu that appears in a circular shape around the
              center of the touch. Inspired from pinterest and @rauno, it is an
              attempt to create a menu that is both functional and aesthetically
              pleasing.
            </ComponentDescription>
            <div className="flex gap-2 mt-2">
              <ComponentTag>react</ComponentTag>
              <ComponentTag>tailwindcss</ComponentTag>
              <ComponentTag>motion</ComponentTag>
            </div>
            <div className="flex items-center justify-between gap-2 mt-6 bg-neutral-800/20 shadow-layered rounded-xl p-3">
              <span className="font-mono text-sm tracking-tight">
                <span className="text-orange-600">npx</span>{" "}
                <span className="text-neutral-400">arcticui</span> add
                radial-menu
              </span>
              <CopyComponent command="npx arcticui add radial-menu" />
            </div>
          </div>
          <RadialMenuView />
        </div>
        <div className="flex w-full px-40 h-auto gap-20 max-lg:flex-col max-md:px-12">
          <div className="flex flex-col gap-2">
            <ComponentHeading>AI Orb</ComponentHeading>
            <ComponentDescription>
              An interactive animated orb component that responds to audio
              input, creating a mesmerizing visual experience. Features
              real-time audio pitch detection and smooth gradient animations
              powered by mesh gradients.
            </ComponentDescription>
            <div className="flex gap-2 mt-2">
              <ComponentTag>react</ComponentTag>
              <ComponentTag>audio</ComponentTag>
              <ComponentTag>shaders</ComponentTag>
              <ComponentTag>paper</ComponentTag>
            </div>
            <div className="flex items-center justify-between gap-2 mt-6 bg-neutral-800/20 shadow-layered rounded-xl p-3">
              <span className="font-mono text-sm tracking-tight">
                <span className="text-orange-600">npx</span>{" "}
                <span className="text-neutral-400">arcticui</span> add ai-orb
              </span>
              <CopyComponent command="npx arcticui add ai-orb" />
            </div>
          </div>
          <AIOrbView />
        </div>
        <div className="flex w-full px-40 h-auto gap-20 max-lg:flex-col max-md:px-12">
          <div className="flex flex-col gap-2">
            <ComponentHeading>Liquid Glass</ComponentHeading>
            <ComponentDescription>
              A CSS displacement-map glass effect that warps whatever is behind
              it. Drag the panel around to see the lens distortion shift in
              real time. No WebGL — just SVG filters and{" "}
              <code>backdrop-filter</code>.
            </ComponentDescription>
            <div className="flex gap-2 mt-2">
              <ComponentTag>react</ComponentTag>
              <ComponentTag>svg filters</ComponentTag>
              <ComponentTag>backdrop-filter</ComponentTag>
            </div>
            <div className="flex items-center justify-between gap-2 mt-6 bg-neutral-800/20 shadow-layered rounded-xl p-3">
              <span className="font-mono text-sm tracking-tight">
                <span className="text-orange-600">npx</span>{" "}
                <span className="text-neutral-400">arcticui</span> add
                liquid-glass
              </span>
              <CopyComponent command="npx arcticui add liquid-glass" />
            </div>
          </div>
          <LiquidGlassView />
        </div>
      </div>
    </div>
  );
}
