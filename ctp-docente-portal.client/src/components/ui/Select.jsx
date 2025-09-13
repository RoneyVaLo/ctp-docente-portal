import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../utils/cn";

// Context para manejar el estado del Select
const SelectContext = React.createContext({
  value: "",
  onValueChange: () => {},
  open: false,
  onOpenChange: () => {},
  placeholder: "",
});

// Componente principal Select
const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [open, setOpen] = React.useState(false);
  const selectRef = React.useRef(null);

  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange =
    value !== undefined ? onValueChange : setInternalValue;

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        onOpenChange: setOpen,
        selectRef,
      }}
    >
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// SelectGroup - Simple wrapper
const SelectGroup = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

// SelectValue - Muestra el valor seleccionado
const SelectValue = ({ placeholder, options = [], ...props }) => {
  const { value } = React.useContext(SelectContext);
  const selectedOption = options.find((opt) => opt.id === parseInt(value));
  const valueDisplay = selectedOption
    ? selectedOption.name
    : value || placeholder;
  return (
    <span {...props} className="text-black text-center w-full">
      {/* {`${value}` || placeholder} */}
      {valueDisplay}
    </span>
  );
};

// SelectTrigger - Botón que abre el select
const SelectTrigger = React.forwardRef((props, ref) => {
  const { className, children, ...restProps } = props;
  const { open, onOpenChange } = React.useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => onOpenChange(!open)}
      {...restProps}
    >
      {children}
      {open ? (
        <ChevronUp className="h-4 w-4 opacity-80 text-black" />
      ) : (
        <ChevronDown className="h-4 w-4 opacity-80 text-black" />
      )}
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

// SelectContent - Contenedor del dropdown
const SelectContent = React.forwardRef((props, ref) => {
  const { className, children, position = "popper", ...restProps } = props;
  const { open } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 max-h-40 min-w-[8rem] w-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-md bg-popover text-popover-foreground shadow-md bg-slate-300/80 dark:bg-slate-400/90 backdrop-blur-sm",
        "animate-in fade-in-0 zoom-in-95",
        position === "popper" && "top-full mt-1",
        className
      )}
      {...restProps}
    >
      <div>{children}</div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

// SelectLabel - Etiqueta para grupos
const SelectLabel = React.forwardRef((props, ref) => {
  const { className, ...restProps } = props;
  return (
    <div
      ref={ref}
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...restProps}
    />
  );
});
SelectLabel.displayName = "SelectLabel";

// SelectItem - Elemento individual del select
const SelectItem = React.forwardRef((props, ref) => {
  const { className, children, value, ...restProps } = props;
  const {
    value: selectedValue,
    onValueChange,
    onOpenChange,
  } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  const handleClick = () => {
    onValueChange(value);
    onOpenChange(false);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer text-black font-medium hover:bg-slate-400 dark:hover:bg-slate-600 hover:text-slate-100 select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        className
      )}
      onClick={handleClick}
      {...restProps}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span>{children}</span>
    </div>
  );
});
SelectItem.displayName = "SelectItem";

// SelectSeparator - Separador visual
const SelectSeparator = React.forwardRef((props, ref) => {
  const { className, ...restProps } = props;

  return (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px", className)}
      {...restProps}
    />
  );
});
SelectSeparator.displayName = "SelectSeparator";

// Botones de scroll (simplificados)
const SelectScrollUpButton = React.forwardRef((props, ref) => {
  const { className, ...restProps } = props;
  return (
    <div
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...restProps}
    >
      <ChevronUp className="h-4 w-4" />
    </div>
  );
});
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = React.forwardRef((props, ref) => {
  const { className, ...restProps } = props;
  return (
    <div
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...restProps}
    >
      <ChevronDown className="h-4 w-4" />
    </div>
  );
});
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
