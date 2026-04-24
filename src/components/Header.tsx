
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown, LogIn, Menu } from "lucide-react";
import { customAuth, type User as CustomUser } from "@/lib/customAuth";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { userRole, isAuthenticated } = useAuth();
  const isStudent = userRole?.name === "student";
  const showDiscoverTalent = isAuthenticated && !isStudent;
  const showWorkExperience = isAuthenticated && isStudent;
  const [user, setUser] = useState<CustomUser | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  // Define dashboard routes (routes shown in sidebar)
  const dashboardRoutes = [
    "/",
    "/donations",
    "/scholarships",
    "/events",
    "/volunteers",
    "/organizations",
    "/users",
    "/widgets",
    "/settings",
  ];

  // Check if current route is a dashboard page
  const isDashboardPage = dashboardRoutes.some(route => 
    route === "/" ? location.pathname === "/" : location.pathname.startsWith(route)
  );

  useEffect(() => {
    // Get initial user
    setUser(customAuth.getUser());

    // Listen for auth state changes
    const unsubscribe = customAuth.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Fetch logo URL from settings
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings' as any)
          .select('value')
          .eq('key', 'logo_url')
          .single();

        if (data && (data as any).value) {
          setLogoUrl((data as any).value);
        } else {
          // Use default if no custom logo is set
          setLogoUrl("/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png");
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
        setLogoUrl("/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png");
      } finally {
        setLogoLoading(false);
      }
    };

    fetchLogo();

    // Listen for settings changes
    const settingsSubscription = supabase
      .channel('app_settings_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'app_settings',
          filter: 'key=eq.logo_url'
        }, 
        (payload) => {
          if (payload.new && 'value' in payload.new) {
            setLogoUrl((payload.new as any).value);
          }
        }
      )
      .subscribe();

    return () => {
      settingsSubscription.unsubscribe();
    };
  }, []);

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleCreateAccount = () => {
    navigate("/register");
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
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    
    // For now, just use email since we don't have name in the user object
    // We could fetch profile data if needed
    return user.email || "User";
  };

  return (
    <header className="bg-card border-b border-border px-6 py-1.5 md:py-2 lg:py-3 flex items-center justify-between relative z-50">
      {/* Left Side - Mobile Menu + Images */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button - Phone only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Roll Call logo - links to Overview */}
        <Link to="/">
          <img 
            src="/lovable-uploads/3bf5b36b-46ad-420d-8eb5-7435b9aaad17.png" 
            alt="Roll Call Logo" 
            className="h-7 md:h-9 lg:h-11 object-contain"
          />
        </Link>
        
        {/* Organization logo - links to BuildHope */}
        {!logoLoading && logoUrl && (
          <a href="https://www.buildhopepdx.org/" target="_blank" rel="noopener noreferrer">
            <img 
              src={logoUrl} 
              alt="Organization Logo" 
              className="h-7 md:h-9 lg:h-11 object-contain"
              onError={(e) => {
                e.currentTarget.src = "/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png";
              }}
            />
          </a>
        )}
      </div>

      {/* Center Navigation - Full buttons on lg+, dropdown on md */}
      <div className="hidden lg:flex items-center space-x-6">
        <Link to="/">
          <Button 
            variant="ghost" 
            className={isDashboardPage ? "text-white hover:text-white" : "text-foreground hover:text-white"}
            style={isDashboardPage ? { backgroundColor: "#3d7471" } : {}}
            onMouseEnter={(e) => { if (!isDashboardPage) e.currentTarget.style.backgroundColor = "#3d7471"; }}
            onMouseLeave={(e) => { if (!isDashboardPage) e.currentTarget.style.backgroundColor = ""; }}
          >
            Dashboard
          </Button>
        </Link>
        <Link to="/valued-partners">
          <Button 
            variant="ghost" 
            className={location.pathname === "/valued-partners" ? "text-white hover:text-white" : "text-foreground hover:text-white"}
            style={location.pathname === "/valued-partners" ? { backgroundColor: "#3d7471" } : {}}
            onMouseEnter={(e) => { if (location.pathname !== "/valued-partners") e.currentTarget.style.backgroundColor = "#3d7471"; }}
            onMouseLeave={(e) => { if (location.pathname !== "/valued-partners") e.currentTarget.style.backgroundColor = ""; }}
          >
            Valued Partners
          </Button>
        </Link>
        <Link to="/resources">
          <Button 
            variant="ghost" 
            className={location.pathname === "/resources" ? "text-white hover:text-white" : "text-foreground hover:text-white"}
            style={location.pathname === "/resources" ? { backgroundColor: "#3d7471" } : {}}
            onMouseEnter={(e) => { if (location.pathname !== "/resources") e.currentTarget.style.backgroundColor = "#3d7471"; }}
            onMouseLeave={(e) => { if (location.pathname !== "/resources") e.currentTarget.style.backgroundColor = ""; }}
          >
            Resources
          </Button>
        </Link>
      </div>

      {/* Center Navigation - Dropdown on tablet (md to lg) */}
      <div className="hidden md:flex lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1">
              <span>{isDashboardPage ? "Dashboard" : location.pathname === "/valued-partners" ? "Valued Partners" : location.pathname === "/resources" ? "Resources" : "Navigate"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48 bg-popover">
            <DropdownMenuItem onClick={() => navigate("/")}>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/valued-partners")}>
              Valued Partners
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/resources")}>
              Resources
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right Side - Only show on desktop */}
      <div className="hidden md:flex items-center space-x-4">
        {user ? (
          <>
            {/* Notifications */}
            <NotificationDropdown />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{getUserDisplayName()}</span>
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
              <DropdownMenuItem onClick={handleCreateAccount}>
                Create Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
