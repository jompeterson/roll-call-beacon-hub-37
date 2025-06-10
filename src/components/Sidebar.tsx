
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

interface SidebarProps {
  open: boolean;
}

const navigation = [
  { name: "Overview", href: "/", icon: BarChart3 },
  { name: "Donations", href: "/donations", icon: DollarSign },
  { name: "Scholarships", href: "/scholarships", icon: GraduationCap },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Organizations", href: "/organizations", icon: Building2 },
  { name: "Users", href: "/users", icon: Users },
];

export const Sidebar = ({ open }: SidebarProps) => {
  const location = useLocation();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full pt-20">
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
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
