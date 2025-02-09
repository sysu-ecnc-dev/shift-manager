import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Command } from "lucide-react";
import NavGeneral from "@/components/sidebar/nav-general";
import NavOther from "@/components/sidebar/nav-other";
import NavUser from "@/components/sidebar/nav-user";
import NavManagement from "@/components/sidebar/nav-management";
import { useQuery } from "@tanstack/react-query";
import { getMyInfo } from "@/lib/api";
import { toast } from "sonner";
export default function AppSidebar() {
  const {
    data: myInfo,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-info"],
    queryFn: () => getMyInfo().then((res) => res.data.data),
  });

  if (isPending) return null;

  if (isError) {
    toast.error(error.message);
    return null;
  }

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/" replace>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ECNC</span>
                  <span className="truncate text-xs">假勤系统</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGeneral />
        {myInfo.role === "黑心" && <NavManagement />}
        <NavOther />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
