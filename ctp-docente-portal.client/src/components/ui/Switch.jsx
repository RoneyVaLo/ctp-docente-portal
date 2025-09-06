import React, { useState } from "react";
import { cn } from "@/utils/cn";

const Switch = React.forwardRef(
  (
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      onChange,
      disabled = false,
      id,
      name,
      value,
      required = false,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    // Determinar si es controlado o no controlado
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (event) => {
      const newChecked = event.target.checked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      // Llamar callbacks
      onCheckedChange?.(newChecked);
      onChange?.(event);
    };

    const handleKeyDown = (event) => {
      // Manejar teclas Space y Enter
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (!disabled) {
          const syntheticEvent = {
            target: { checked: !isChecked },
            currentTarget: { checked: !isChecked },
          };
          handleChange(syntheticEvent);
        }
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled}
        disabled={disabled}
        data-state={isChecked ? "checked" : "unchecked"}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isChecked
            ? "bg-blue-600 dark:bg-blue-500"
            : "bg-gray-200 dark:bg-gray-700",
          className
        )}
        onClick={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />

        {/* Input oculto para formularios */}
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => {}} // Manejado por el botón
          id={id}
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
