import { CopyIcon } from "lucide-react";
import RadialMenuView from "@repo/ui/views/radial-menu";

export default function Home() {
  return (
    <div className="flex font-sans flex-col items-center justify-center h-auto w-full gap-20 max-md:gap-10 pb-10">
      <section className="flex flex-col items-center justify-center py-40 gap-4">
        <h1 className="text-5xl font-medium tracking-tight text-neutral-300 text-center max-md:text-4xl max-sm:text-3xl">
          creative <span className="text-orange-600">craftsmanship</span> for
          the web
        </h1>
        <p className=" text-neutral-400 tracking-tight max-w-xl max-md:max-w-2xl max-sm:text-sm max-md:px-12 text-center">
          A handful of bold, experimental crafts that are customizable and
          extendable for your next voyage. Designed for the web, by the
          craftsmen.
        </p>
      </section>
      <div className="flex w-full px-40 h-auto gap-20 max-md:flex-col max-md:px-12">
        <div className="flex flex-col gap-2">
          <span className="font-[560] text-neutral-300">Radial Menu</span>
          <span className="text-sm font-[420] text-neutral-400 max-w-[500px]">
            Experimenting a menu that appears in a circular shape around the
            center of the touch. Inspired from pinterest and @rauno, it is an
            attempt to create a menu that is both functional and aesthetically
            pleasing.
          </span>
          <div className="flex gap-2 mt-2">
            <span className="text-[13px] font-[420] text-neutral-400 bg-neutral-800/80 leading-5 px-1.5 py-0 rounded-md">
              react
            </span>
            <span className="text-[13px] font-[420] text-neutral-400 bg-neutral-800/80 leading-5 px-1.5 py-0 rounded-md">
              tailwindcss
            </span>
            <span className="text-[13px] font-[420] text-neutral-400 bg-neutral-800/80 leading-5 px-1.5 py-0 rounded-md">
              motion
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-6 bg-neutral-800/20 shadow-layered rounded-xl p-3">
            <span className="font-mono text-sm tracking-tight">
              <span className="text-orange-600">npx</span>{" "}
              <span className="text-neutral-400">arcticui</span> add radial-menu
            </span>
            <CopyIcon className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
        <RadialMenuView />
      </div>
    </div>
  );
}
