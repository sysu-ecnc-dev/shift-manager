import SettingNav from "@/components/setting-nav";
import { Separator } from "@/components/ui/separator";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-4 flex flex-col gap-2 mt-8">
      <h1 className="text-2xl font-bold">设置</h1>
      <span className="text-sm text-muted-foreground">
        管理你的个人信息和账户设置
      </span>
      <Separator className="my-6" />
      <div className="flex">
        <SettingNav />
        <Outlet />
      </div>
    </div>
  );
}
