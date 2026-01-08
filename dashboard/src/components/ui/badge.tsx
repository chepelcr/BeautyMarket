import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let style = {};
  let classes = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  if (variant === "default") {
    style = { backgroundColor: "hsl(var(--primary))" };
    classes += " border-transparent text-gray-900 dark:text-white";
  } else if (variant === "secondary") {
    style = { backgroundColor: "hsl(var(--secondary))" };
    classes += " border-transparent text-gray-900 dark:text-white";
  } else if (variant === "destructive") {
    classes += " border-transparent bg-destructive text-destructive-foreground";
  } else if (variant === "outline") {
    classes += " text-foreground";
  }

  return (
    <div
      className={cn(classes, className)}
      style={style}
      {...props}
    />
  );
}

export { Badge };
