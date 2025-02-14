import ThemeProvider from "@/components/provider/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        }))
      );

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <ThemeProvider>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster />
    </ThemeProvider>
  ),
});
