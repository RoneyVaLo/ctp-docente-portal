import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import UserMenu from "./UserMenu";

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí iría la lógica de cierre de sesión
    navigate("/login");
  };

  return (
    <header className="h-16 border-b bg-white flex items-center px-4 sticky top-0 z-10">
      <div className="flex-1 flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {showSearch ? (
          <div className="relative w-full max-w-md ml-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8 w-full"
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(true)}
            className="ml-2"
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <UserMenu onLogout={handleLogout} />
      </div>
    </header>
  );
};

export default Header;
