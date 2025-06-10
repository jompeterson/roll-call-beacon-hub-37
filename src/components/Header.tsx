
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, ChevronDown, LogIn } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const [notificationCount] = useState(3);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulate auth state

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    console.log("User signed out");
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between relative z-50">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <img 
          src="/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png" 
          alt="Roll Call Logo" 
          className="h-8"
        />
      </div>

      {/* Center Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/">
          <Button variant="ghost" className="text-foreground hover:text-primary">
            Dashboard
          </Button>
        </Link>
        <Link to="/valued-partners">
          <Button variant="ghost" className="text-foreground hover:text-primary">
            Valued Partners
          </Button>
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">John Doe</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          /* Sign In Dropdown */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuItem onClick={handleSignIn}>
                Sign In
              </DropdownMenuItem>
              <DropdownMenuItem>
                Create Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
