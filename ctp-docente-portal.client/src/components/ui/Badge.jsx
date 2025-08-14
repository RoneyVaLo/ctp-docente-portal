import * as React from "react";
import { cn } from "../../utils/cn";

// Clases base del badge
const badgeBaseClasses =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

// Variantes del badge
const badgeVariants = {
  default:
    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline: "text-foreground dark:text-white",
};

function Badge({ className, variant = "default", ...props }) {
  // Obtener las clases de la variante
  const variantClasses = badgeVariants[variant] || badgeVariants.default;

  return (
    <div
      className={cn(badgeBaseClasses, variantClasses, className)}
      {...props}
    />
  );
}

export { Badge };
