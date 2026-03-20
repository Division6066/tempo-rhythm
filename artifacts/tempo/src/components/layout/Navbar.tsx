import { Link, useLocation } from "wouter";
import { Search, Moon, Sun, Menu, User, Settings, LogOut } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuthActions } from "@convex-dev/auth/react";
import { convex } from "@/lib/convex";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ConvexLogoutMenuItem() {
  const { signOut } = useAuthActions();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await signOut();
    setLocation("/login");
  };

  return (
    <DropdownMenuItem onClick={handleLogout} className="min-h-[44px] cursor-pointer text-destructive">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </DropdownMenuItem>
  );
}

function FallbackLogoutMenuItem() {
  const [, setLocation] = useLocation();

  return (
    <DropdownMenuItem onClick={() => setLocation("/login")} className="min-h-[44px] cursor-pointer text-destructive">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </DropdownMenuItem>
  );
}

interface NavbarProps {
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
}

export default function Navbar({ onOpenSearch, onToggleMobileSidebar }: NavbarProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <Link href="/">
          <span className="text-lg font-display font-bold text-foreground tracking-tight cursor-pointer hidden md:block">
            Tempo Flow
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="User menu"
            >
              <User size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setLocation("/preferences")} className="min-h-[44px] cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {convex ? <ConvexLogoutMenuItem /> : <FallbackLogoutMenuItem />}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
