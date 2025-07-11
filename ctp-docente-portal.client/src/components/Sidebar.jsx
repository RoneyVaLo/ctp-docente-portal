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
        "shadow-2xl h-screen flex flex-col transition-all duration-300 sticky top-0 z-10",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 shadow-2xl flex items-center justify-between hover:cursor-default transition-transform">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          <BookOpen className="h-6 w-6 text-gray-900 shrink-0 dark:text-white" />
          <span
            className={cn("font-bold text-gray-900 dark:text-white", collapsed && "hidden")}
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
            href="/"
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            active={location.pathname === "/"}
            collapsed={collapsed}
          />
          <NavItem
            href="/calificaciones"
            icon={<CheckSquare className="h-5 w-5" />}
            label="Calificaciones"
            active={location.pathname.includes("/calificaciones")}
            collapsed={collapsed}
          />
          <NavItem
            href="/asistencia"
            icon={<Calendar className="h-5 w-5" />}
            label="Asistencia"
            active={location.pathname.includes("/asistencia")}
            collapsed={collapsed}
          />
          <NavItem
            href="/reportes"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Reportes"
            active={location.pathname.includes("/reportes")}
            collapsed={collapsed}
          />
          <NavItem
            href="/notificaciones"
            icon={<Bell className="h-5 w-5" />}
            label="Notificaciones"
            active={location.pathname.includes("/notificaciones")}
            collapsed={collapsed}
          />
          <NavItem
            href="/estudiantes"
            icon={<Users className="h-5 w-5" />}
            label="Estudiantes"
            active={location.pathname.includes("/estudiantes")}
            collapsed={collapsed}
          />
        </nav>
      </div>

      <div className="p-4 border-t">
        <NavItem
          href="/configuracion"
          icon={<Settings className="h-5 w-5" />}
          label="Configuración"
          active={location.pathname.includes("/configuracion")}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
}
