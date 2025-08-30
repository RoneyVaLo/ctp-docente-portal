import React from "react";

const TabsTrigger = ({ value, children, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 shadow-sm"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      }`}
    >
      {children}
    </button>
  );
};

export default TabsTrigger;
