import GuestOnlyGuard from "@/components/guard/guest-only-guard";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { GalleryVerticalEndIcon } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <GuestOnlyGuard>
      <div className="min-h-svh grid grid-cols-2">
        <div className="flex flex-col p-10">
          <div>
            <Link to="/auth/login" className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-md bg-primary text-primary-foreground h-6 w-6">
                <GalleryVerticalEndIcon className="size-4" />
              </div>
              ECNC 假勤系统
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <Outlet />
            </div>
          </div>
        </div>
        <div className="relative">
          <img
            src="/auth_background.png"
            alt="auth background"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </GuestOnlyGuard>
  );
}
