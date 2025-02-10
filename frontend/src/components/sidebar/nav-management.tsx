import { Calendar, LucideIcon, User } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";

const navItems: {
  label: string;
  icon: LucideIcon;
  href: string;
}[] = [
  {
    label: "用户",
    icon: User,
    href: "/management/users",
  },
  {
    label: "班表模板",
    icon: Calendar,
    href: "/management/schedule-templates",
  },
];

export default function NavManagement() {
  const { location } = useRouterState();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>管理</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === item.href}
            >
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
