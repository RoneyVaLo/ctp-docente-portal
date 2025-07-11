import { LogOut, Settings, User } from "lucide-react";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import DropdownMenu from "./ui/DropdownMenu";

export default function UserMenu({ onLogout }) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <Avatar.Image src="/placeholder.svg" alt="Profesor" />
            <Avatar.Fallback>PR</Avatar.Fallback>
          </Avatar>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-56" align="end" forceMount>
        <DropdownMenu.Label className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Prof. Martínez</p>
            <p className="text-xs leading-none text-muted-foreground">
              profesor@colegio.edu
            </p>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <User className="mr-2 h-4 w-4" />
          <span>Mi perfil</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
