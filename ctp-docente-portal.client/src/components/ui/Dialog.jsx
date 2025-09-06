import React, { useState, useContext, createContext, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

// Context para manejar el estado del dialog
const DialogContext = createContext();

function Dialog({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Si se proporciona 'open', es controlado externamente
  const isControlled = open !== undefined;
  const actualOpen = isControlled ? open : isOpen;

  const handleOpenChange = (newOpen) => {
    if (!isControlled) {
      setIsOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const contextValue = {
    open: actualOpen,
    onOpenChange: handleOpenChange,
  };

  return (
    <DialogContext.Provider value={contextValue}>
      <div data-slot="dialog" {...props}>
        {children}
      </div>
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild = false, ...props }) {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("DialogTrigger must be used within a Dialog");
  }

  const handleClick = (e) => {
    context.onOpenChange(true);
    props.onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
      "data-slot": "dialog-trigger",
    });
  }

  return (
    <button
      type="button"
      data-slot="dialog-trigger"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

function DialogPortal({ children, container, ...props }) {
  const context = useContext(DialogContext);

  if (!context?.open) return null;

  // Usar React.createPortal si está disponible, sino renderizar en el lugar
  if (typeof document !== "undefined" && React.createPortal) {
    const portalContainer = container || document.body;
    return React.createPortal(
      <div data-slot="dialog-portal" {...props}>
        {children}
      </div>,
      portalContainer
    );
  }

  return (
    <div data-slot="dialog-portal" {...props}>
      {children}
    </div>
  );
}

function DialogClose({ children, asChild = false, ...props }) {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("DialogClose must be used within a Dialog");
  }

  const handleClick = (e) => {
    context.onOpenChange(false);
    props.onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
      "data-slot": "dialog-close",
    });
  }

  return (
    <button
      type="button"
      data-slot="dialog-close"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

function DialogOverlay({ className, ...props }) {
  const context = useContext(DialogContext);

  const handleClick = (e) => {
    if (e.target === e.currentTarget) {
      context.onOpenChange(false);
    }
  };

  return (
    <div
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200",
        context?.open ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onEscapeKeyDown,
  //   onInteractOutside,
  ...props
}) {
  const context = useContext(DialogContext);

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && context?.open) {
        if (onEscapeKeyDown) {
          onEscapeKeyDown(e);
          if (e.defaultPrevented) return;
        }
        context.onOpenChange(false);
      }
    };

    if (context?.open) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll del body
      // document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [context?.open, onEscapeKeyDown, context]);

  if (!context?.open) return null;

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-white p-6 shadow-lg transition-all duration-200 sm:max-w-lg dark:bg-gray-900 dark:border-gray-700",
          context?.open ? "scale-100 opacity-100" : "scale-95 opacity-0",
          className
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-gray-950 dark:focus:ring-gray-300">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
