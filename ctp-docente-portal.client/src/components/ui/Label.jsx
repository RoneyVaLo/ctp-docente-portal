import * as React from "react";
import { cn } from "../../utils/cn";

// Clases base del label (reemplazo de labelVariants)
const labelBaseClasses =
  "min-h-7 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

const Label = React.forwardRef((props, ref) => {
  const { className, ...restProps } = props;

  return (
    <label
      ref={ref}
      className={cn(labelBaseClasses, className)}
      {...restProps}
    />
  );
});

Label.displayName = "Label";

export { Label };
