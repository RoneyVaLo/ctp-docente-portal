import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BookOpen,
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Home,
  Bell,
  Settings,
  Users,
} from "lucide-react";
import Button from "./ui/Button";
import NavItem from "./NavItem";
import { cn } from "../utils/cn";

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={cn(
        "bg-white border-r h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          <BookOpen className="h-6 w-6 text-blue-600 shrink-0" />
          <span
            className={cn("font-bold text-blue-900", collapsed && "hidden")}
          >
            Admin Docente
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          <NavItem
            href="/dashboard"
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            active={location.pathname === "/dashboard"}
            collapsed={collapsed}
          />
          <NavItem
            href="/dashboard/calificaciones"
            icon={<CheckSquare className="h-5 w-5" />}
            label="Calificaciones"
            active={location.pathname.includes("/dashboard/calificaciones")}
            collapsed={collapsed}
          />
          <NavItem
            href="/dashboard/asistencia"
            icon={<Calendar className="h-5 w-5" />}
            label="Asistencia"
            active={location.pathname.includes("/dashboard/asistencia")}
            collapsed={collapsed}
          />
          <NavItem
            href="/dashboard/reportes"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Reportes"
            active={location.pathname.includes("/dashboard/reportes")}
            collapsed={collapsed}
          />
          <NavItem
            href="/dashboard/notificaciones"
            icon={<Bell className="h-5 w-5" />}
            label="Notificaciones"
            active={location.pathname.includes("/dashboard/notificaciones")}
            collapsed={collapsed}
          />
          <NavItem
            href="/dashboard/estudiantes"
            icon={<Users className="h-5 w-5" />}
            label="Estudiantes"
            active={location.pathname.includes("/dashboard/estudiantes")}
            collapsed={collapsed}
          />
        </nav>
      </div>

      <div className="p-4 border-t">
        <NavItem
          href="/dashboard/configuracion"
          icon={<Settings className="h-5 w-5" />}
          label="Configuración"
          active={location.pathname.includes("/dashboard/configuracion")}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
}
