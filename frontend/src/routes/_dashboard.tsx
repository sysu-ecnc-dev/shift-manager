import RequireAuthGuard from "@/components/guard/require-auth-guard";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/header";
export const Route = createFileRoute("/_dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full flex flex-col pb-2">
          <Header />
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </RequireAuthGuard>
  );
}
