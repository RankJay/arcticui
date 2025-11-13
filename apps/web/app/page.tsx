import RadialMenuView from "@repo/ui/views/radial-menu";
import HeroSection from "../views/hero";
import {
  ComponentDescription,
  ComponentHeading,
  ComponentTag,
} from "../views/component";
import { CopyComponent } from "../views/copy-cmd";

export default function Home() {
  return (
    <div className="flex font-sans flex-col items-center justify-center h-auto w-full gap-20 max-md:gap-10 pb-10">
      <HeroSection />
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
              <span className="text-neutral-400">arcticui</span> add radial-menu
            </span>
            <CopyComponent command="npx arcticui add radial-menu" />
          </div>
        </div>
        <RadialMenuView />
      </div>
    </div>
  );
}
