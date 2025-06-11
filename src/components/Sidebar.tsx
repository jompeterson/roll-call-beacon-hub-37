
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  DollarSign,
  GraduationCap,
  Calendar,
  Building2,
  Users,
} from "lucide-react";
import { customAuth } from "@/lib/customAuth";
import { useState, useEffect } from "react";

interface SidebarProps {
  open: boolean;
}

const baseNavigation = [
  { name: "Overview", href: "/", icon: BarChart3 },
  { name: "Donations", href: "/donations", icon: DollarSign },
  { name: "Scholarships", href: "/scholarships", icon: GraduationCap },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Organizations", href: "/organizations", icon: Building2 },
];

const authenticatedNavigation = [
  ...baseNavigation,
  { name: "Users", href: "/users", icon: Users },
];

export const Sidebar = ({ open }: SidebarProps) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get initial auth state
    setIsAuthenticated(!!customAuth.getUser());

    // Listen for auth state changes
    const unsubscribe = customAuth.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const navigation = isAuthenticated ? authenticatedNavigation : baseNavigation;

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full pt-20">
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                style={isActive ? { backgroundColor: "#294865" } : {}}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
