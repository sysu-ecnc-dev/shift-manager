import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";
import { Code, Settings } from "lucide-react";

export default function NavOther() {
  const settingsReges = /^\/settings/;
  const { location } = useRouterState();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>其它</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={settingsReges.test(location.pathname)}
          >
            <Link to="/settings" replace>
              <Settings />
              <span>设置</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a
              href="https://github.com/sysu-ecnc-dev/shift-manager"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code />
              <span>源代码</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
