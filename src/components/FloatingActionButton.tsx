
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User, Building2, GraduationCap, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Don't render the FAB if user is not authenticated
  if (!user) {
    return null;
  }

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
      {isExpanded && (
        <div className="flex flex-col space-y-3 mb-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.name}
                className="flex items-center justify-end space-x-3 animate-in slide-in-from-bottom-2 fade-in-0"
                style={{ animationDelay: `${index * 50}ms` }}
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
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg text-white transition-all duration-300 ease-in-out",
          isExpanded && "rotate-45"
        )}
        style={{ backgroundColor: "#294865" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Plus className="h-6 w-6 transition-transform duration-300 ease-in-out" />
      </Button>
    </div>
  );
};
