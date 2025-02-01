import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Code } from "lucide-react";

export default function NavSecond() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>其它</SidebarGroupLabel>
      <SidebarMenu>
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
