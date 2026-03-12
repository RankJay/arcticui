import { cn } from "../lib/utils";

export function ComponentHeading({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <span
      data-slot="component-heading"
      className={cn("font-[560] text-neutral-300", className)}
      {...props}
    />
  );
}

export function ComponentDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <span
      data-slot="component-description"
      className={cn(
        "text-sm font-[420] text-neutral-400 max-w-[500px]",
        className,
      )}
      {...props}
    />
  );
}

export function ComponentTag({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <span
      data-slot="component-tag"
      className={cn(
        "text-[13px] font-[420] text-neutral-400 bg-neutral-800/80 leading-5 px-1.5 py-0 rounded-md",
        className,
      )}
      {...props}
    />
  );
}
