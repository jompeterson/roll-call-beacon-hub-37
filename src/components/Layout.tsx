
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "./Header";
import { AppSidebar } from "./AppSidebar";
import { FloatingActionButton } from "./FloatingActionButton";
import { AuthProtection } from "./AuthProtection";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex">
        <AuthProtection />
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </SidebarInset>
        <FloatingActionButton />
      </div>
    </SidebarProvider>
  );
};
