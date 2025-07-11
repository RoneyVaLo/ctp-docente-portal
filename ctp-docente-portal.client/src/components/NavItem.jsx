import { NavLink } from "react-router-dom";
import { cn } from "../utils/cn";

export default function NavItem({ href, icon, label, active, collapsed }) {
  return (
    <NavLink to={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors my-2",
          active
            ? "bg-gray-400 text-gray-100 dark:bg-slate-600 dark:text-slate-100"
            : "text-gray-900 hover:text-gray-100 hover:bg-gray-400 dark:text-gray-100 dark:hover:bg-slate-600",
          collapsed && "justify-center px-2"
        )}
      >
        {icon}
        <span className={cn("text-sm font-medium", collapsed && "hidden")}>
          {label}
        </span>
      </div>
    </NavLink>
  );
}
