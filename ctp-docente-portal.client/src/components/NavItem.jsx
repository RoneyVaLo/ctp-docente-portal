import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

export default function NavItem({ href, icon, label, active, collapsed }) {
  return (
    <Link to={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
          active
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100",
          collapsed && "justify-center px-2"
        )}
      >
        {icon}
        <span className={cn("text-sm font-medium", collapsed && "hidden")}>
          {label}
        </span>
      </div>
    </Link>
  );
}
