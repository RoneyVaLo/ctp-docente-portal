import * as React from "react";
import { cn } from "../../utils/cn";

const Separator = React.forwardRef((props, ref) => {
  const {
    className,
    orientation = "horizontal",
    decorative = true,
    ...restProps
  } = props;

  // Determinar el elemento HTML apropiado basado en si es decorativo
  const Component = decorative ? "div" : "hr";

  // Clases CSS basadas en la orientación
  const orientationClasses =
    orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]";

  return (
    <Component
      ref={ref}
      className={cn("shrink-0 bg-red-500", orientationClasses, className)}
      {...restProps}
    />
  );
});

Separator.displayName = "Separator";

export { Separator };
