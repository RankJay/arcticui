"use client";

import { CopyIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export function CopyComponent({
  className,
  command,
  ...props
}: React.ComponentProps<"svg"> & { command: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    toast.success("Command copied to clipboard");
  };
  return (
    <CopyIcon
      className={cn(
        "w-4 h-4 text-neutral-400 hover:text-neutral-100 cursor-pointer",
        className
      )}
      {...props}
      onClick={handleCopy}
    />
  );
}
