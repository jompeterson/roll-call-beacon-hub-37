
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User, Building2, GraduationCap, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { name: "New User", icon: User, color: "bg-blue-500 hover:bg-blue-600" },
    { name: "New Organization", icon: Building2, color: "bg-green-500 hover:bg-green-600" },
    { name: "New Scholarship", icon: GraduationCap, color: "bg-purple-500 hover:bg-purple-600" },
    { name: "New Request", icon: FileText, color: "bg-orange-500 hover:bg-orange-600" },
    { name: "New Event", icon: Calendar, color: "bg-red-500 hover:bg-red-600" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Buttons */}
      <div className={cn(
        "flex flex-col space-y-3 mb-4 transition-all duration-300",
        isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.name}
              className="flex items-center justify-end space-x-3"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <span className="bg-card border border-border px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
                {action.name}
              </span>
              <Button
                size="lg"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg text-white",
                  action.color
                )}
                onClick={() => console.log(`Creating ${action.name}`)}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-transform duration-300",
          isExpanded && "rotate-45"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};
