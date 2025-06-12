
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { FloatingActionButton } from "./FloatingActionButton";
import { AuthProtection } from "./AuthProtection";

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <AuthProtection />
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <FloatingActionButton />
    </div>
  );
};
