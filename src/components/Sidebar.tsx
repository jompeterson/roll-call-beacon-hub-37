
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Hammer,
  HandHeart,
  GraduationCap,
  Calendar,
  Building2,
  Users,
  Settings,
  Layout,
  User,
  ChevronDown,
  LogIn,
} from "lucide-react";
import { customAuth } from "@/lib/customAuth";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

const baseNavigation = [
  { name: "Overview", href: "/", icon: BarChart3 },
  { name: "Donations", href: "/donations", icon: Hammer },
  { name: "Scholarships", href: "/scholarships", icon: GraduationCap },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Volunteers", href: "/volunteers", icon: HandHeart },
  { name: "Organizations", href: "/organizations", icon: Building2 },
];

const authenticatedNavigation = [
  ...baseNavigation,
  { name: "Users", href: "/users", icon: Users },
];

const adminNavigation = [
  ...authenticatedNavigation,
  { name: "Widgets", href: "/widgets", icon: Layout },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isAdministrator } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial auth state
    const currentUser = customAuth.getUser();
    setIsAuthenticated(!!currentUser);
    setUser(currentUser);

    // Listen for auth state changes
    const unsubscribe = customAuth.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Choose navigation based on user role
  const getNavigation = () => {
    if (!isAuthenticated) return baseNavigation;
    if (isAdministrator) return adminNavigation;
    return authenticatedNavigation;
  };

  const navigation = getNavigation();

  const handleSignIn = () => {
    navigate("/login");
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleCreateAccount = () => {
    navigate("/register");
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate("/login");
    }
    
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.email || "User";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full pt-4">
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => {
                if (isMobile && onOpenChange) {
                  onOpenChange(false);
                }
              }}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              style={isActive ? { backgroundColor: "#3d7471" } : {}}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Mobile Authentication Section */}
      {isMobile && (
        <div className="px-4 py-4 border-t border-border">
          {isAuthenticated ? (
            <div className="space-y-2">
              {/* Notifications */}
              <div className="flex justify-center">
                <NotificationDropdown />
              </div>
              
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full flex items-center justify-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{getUserDisplayName()}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 bg-popover">
                  <DropdownMenuItem onClick={() => {
                    navigate("/profile");
                    if (onOpenChange) onOpenChange(false);
                  }}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* Sign In Section for non-authenticated users */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-popover">
                <DropdownMenuItem onClick={handleSignIn}>
                  Sign In
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateAccount}>
                  Create Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0 bg-card">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <SidebarContent />
    </div>
  );
};
