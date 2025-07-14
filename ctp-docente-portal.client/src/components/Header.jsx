import { useNavigate } from "react-router-dom";
import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import Button from "./ui/Button";
import UserMenu from "./UserMenu";
import DarkModeToggle from "./DarkModeToggle";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí iría la lógica de cierre de sesión
    navigate("/login");
  };

  return (
    <header className="h-16 shadow-md bg-gray-50 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 dark:text-white flex items-center px-4 sticky top-0 z-10">
      <div className="flex-1 flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <DarkModeToggle />

        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <UserMenu onLogout={handleLogout} />
      </div>
    </header>
  );
};

export default Header;
