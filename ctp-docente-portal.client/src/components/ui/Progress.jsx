import * as React from "react";
import { cn } from "../../utils/cn";

const Progress = React.forwardRef((props, ref) => {
  const { className, value = 0, max = 100, ...restProps } = props;

  // Calcular el porcentaje de progreso
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-[#c1c1c1] dark:bg-[#d7d7d7]",
        className
      )}
      {...restProps}
    >
      <div
        className="h-full w-full flex-1 bg-[#171717] transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
});

Progress.displayName = "Progress";

export { Progress };
