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
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { roles } = useAuth();

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (isMobile && isMobileOpen) {
      onCloseMobile();
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div
      className={cn(
        `${
          !isMobileOpen
            ? "hidden"
            : "flex fixed inset-0 z-50 bg-background dark:bg-background-dark"
        } shadow-2xl h-screen sm:flex flex-col transition-all duration-300 sm:sticky top-0 z-[51]`,
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
          <img
            src="/ctp.avif"
            alt="Logo del CTP de Los Chiles"
            className="max-h-6 max-w-6"
          />
          <span
            className={cn(
              "font-bold text-gray-900 dark:text-white",
              collapsed && "hidden"
            )}
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
        <aside className="space-y-1 px-2">
          <NavItem
            href="/"
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            active={location.pathname === "/"}
            collapsed={collapsed}
          />
          {roles.includes("Docente") && (
            <>
              <NavItem
                href="/calificaciones"
                icon={<CheckSquare className="h-5 w-5" />}
                label="Calificaciones"
                active={
                  location.pathname.includes("/calificaciones") ||
                  location.pathname.includes("/item")
                }
                collapsed={collapsed}
              />
              <NavItem
                href="/asistencia"
                icon={<Calendar className="h-5 w-5" />}
                label="Asistencia"
                active={location.pathname.includes("/asistencia")}
                collapsed={collapsed}
              />
            </>
          )}
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
        </aside>
      </div>

      {roles.includes("Administrativo") && (
        <div className="py-4 px-2 border-t">
          <NavItem
            href="/configuracion"
            icon={<Settings className="h-5 w-5" />}
            label="Configuración"
            active={location.pathname.includes("/configuracion")}
            collapsed={collapsed}
          />
        </div>
      )}
    </div>
  );
}
