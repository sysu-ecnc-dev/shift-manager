import RequireAuthGuard from "@/components/guard/require-auth-guard";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </RequireAuthGuard>
  );
}
