/**
 * Utility function to merge class names
 * Similar to clsx or cn from shadcn/ui
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ").trim();
}
