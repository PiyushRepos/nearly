import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding font-sans font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Terracotta CTA — primary brand action
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] shadow-sm",
        // Forest green — used on dark/green surfaces
        green:
          "bg-brand-green text-brand-cream hover:bg-brand-green/90 active:scale-[0.97] shadow-sm",
        // Outlined terracotta — secondary on light bg
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/8 active:scale-[0.97]",
        // Outlined on dark/green bg
        "outline-cream":
          "border-2 border-brand-cream/70 text-brand-cream bg-transparent hover:bg-brand-cream/10 active:scale-[0.97]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/85 active:scale-[0.97]",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-10 gap-2 px-5 text-sm",
        xs: "h-7 gap-1 px-3 text-xs",
        sm: "h-9 gap-1.5 px-4 text-sm",
        lg: "h-12 gap-2 px-7 text-base",
        xl: "h-14 gap-2.5 px-9 text-base",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
