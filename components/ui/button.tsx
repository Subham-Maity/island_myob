import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg text-xs font-medium transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold",
        outline: "border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200",
        ghost: "hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100",
        secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
      },
      size: {
        default: "h-8 px-3 py-1",
        sm: "h-7 px-2.5 text-xs",
        xs: "h-6 px-2 text-[11px]",
        lg: "h-9 px-4 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

