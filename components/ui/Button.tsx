import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide " +
  "transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood select-none";

const variants: Record<Variant, string> = {
  solid:
    "bg-oxblood text-on-dark hover:bg-oxblood-bright border border-oxblood",
  outline:
    "border border-bone/25 text-bone hover:border-oxblood hover:text-oxblood bg-transparent",
  ghost: "text-bone-dim hover:text-bone hover:bg-ink-raise",
  link: "text-oxblood hover:text-oxblood-bright p-0 h-auto link-underline",
};

const sizes: Record<Size, string> = {
  sm: "text-[0.7rem] uppercase tracking-[0.16em] px-3 h-9",
  md: "text-[0.75rem] uppercase tracking-[0.16em] px-5 h-11",
  lg: "text-[0.8rem] uppercase tracking-[0.18em] px-7 h-14",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "solid", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          base,
          variants[variant],
          variant !== "link" && sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
