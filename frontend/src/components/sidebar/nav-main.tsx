import { House, LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";

const navItems: {
  label: string;
  icon: LucideIcon;
  href: string;
}[] = [
  {
    label: "首页",
    icon: House,
    href: "/",
  },
];
export default function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>通用</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton asChild>
              <Link to={item.href} replace>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
