
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { FloatingActionButton } from "./FloatingActionButton";
import { AuthProtection } from "./AuthProtection";
import { SplashScreen } from "./SplashScreen";
import { customAuth } from "@/lib/customAuth";
import { shouldShowSplash, SPLASH_ENTRY_KEY } from "@/lib/splashScreen";

const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(
    () => window.innerWidth >= 768 && window.innerWidth < 1024
  );
  useEffect(() => {
    const handleResize = () => setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isTablet;
};

export const Layout = () => {
  const [signedIn, setSignedIn] = useState(() => !!customAuth.getUser());
  const [authReady, setAuthReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(() => sessionStorage.getItem(SPLASH_ENTRY_KEY) === "true");
  const isTablet = useIsTablet();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isTablet);

  useEffect(() => customAuth.onAuthStateChange(user => {
    setSignedIn(!!user);
    setAuthReady(true);
  }), []);

  // Auto-collapse on tablet, expand on desktop
  useEffect(() => {
    setSidebarCollapsed(isTablet);
  }, [isTablet]);

  if (!authReady) {
    return <div className="splash-screen" role="status" aria-label="Loading Roll Call" />;
  }

  if (shouldShowSplash(signedIn, hasEntered)) {
    return <SplashScreen onEnter={() => {
      sessionStorage.setItem(SPLASH_ENTRY_KEY, "true");
      setHasEntered(true);
    }} />;
  }

  return (
    <>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <AuthProtection />
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
        <FloatingActionButton />
      </div>
    </>
  );
};
