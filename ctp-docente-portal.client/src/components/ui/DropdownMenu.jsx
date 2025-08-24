import { useState, useRef, useEffect, forwardRef } from "react";

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerChild, setTriggerChild] = useState(null);
  const [contentChild, setContentChild] = useState(null);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  // Extraer trigger y content de los children
  const childrenArray = Array.isArray(children) ? children : [children];

  useEffect(() => {
    const trigger = childrenArray.find(
      (child) => child?.type?.displayName === "DropdownMenuTrigger"
    );
    const content = childrenArray.find(
      (child) => child?.type?.displayName === "DropdownMenuContent"
    );

    if (trigger) {
      setTriggerChild({
        ...trigger,
        props: { ...trigger.props, onClick: handleToggle },
      });
    }

    if (content) {
      setContentChild({
        ...content,
        props: { ...content.props, isOpen, onClose: handleClose },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, isOpen]);

  return (
    <div className="relative">
      {triggerChild}
      {contentChild}
    </div>
  );
};

const DropdownMenuTrigger = forwardRef(
  ({ asChild, children, onClick, ...props }, ref) => {
    if (asChild) {
      return (
        <div ref={ref} onClick={onClick} {...props}>
          {children}
        </div>
      );
    }

    return (
      <button ref={ref} onClick={onClick} {...props}>
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = forwardRef(
  (
    {
      className = "",
      align = "center",
      isOpen = false,
      onClose,
      children,
      ...props
    },
    ref
  ) => {
    const contentRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (contentRef.current && !contentRef.current.contains(event.target)) {
          onClose?.();
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const alignClasses = {
      start: "left-0",
      center: "left-1/2 -translate-x-1/2",
      end: "right-0",
    };

    return (
      <div
        ref={contentRef}
        className={`absolute top-full mt-1 z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-lg ${alignClasses[align]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuLabel = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`px-2 py-1.5 text-sm font-semibold ${className}`}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuItem = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = forwardRef(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`-mx-1 my-1 h-px ${className}`} {...props} />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

DropdownMenu.Trigger = DropdownMenuTrigger;
DropdownMenu.Content = DropdownMenuContent;
DropdownMenu.Label = DropdownMenuLabel;
DropdownMenu.Item = DropdownMenuItem;
DropdownMenu.Separator = DropdownMenuSeparator;

export default DropdownMenu;
