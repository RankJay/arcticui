import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ComponentPreview({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="not-prose border-border my-6 overflow-hidden rounded-xl border">
      <div className={cn("flex min-h-[350px] items-center justify-center p-10", className)}>
        {children}
      </div>
    </div>
  );
}
