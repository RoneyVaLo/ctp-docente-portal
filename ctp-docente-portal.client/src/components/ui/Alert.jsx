import * as React from "react";
import { cn } from "../../utils/cn";

// Clases base del alert
const alertBaseClasses =
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground";

// Variantes del alert
const alertVariants = {
  default: "bg-background text-foreground",
  destructive:
    "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
};

const Alert = React.forwardRef((props, ref) => {
  const { className, variant = "default", ...restProps } = props;

  // Obtener las clases de la variante
  const variantClasses = alertVariants[variant] || alertVariants.default;

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertBaseClasses, variantClasses, className)}
      {...restProps}
    />
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef((props, ref) => {
  const { className, ...restProps } = props;
  return (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...restProps}
    />
  );
});
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef((props, ref) => {
  const { className, ...restProps } = props;
  return (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...restProps}
    />
  );
});
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
