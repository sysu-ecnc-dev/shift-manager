import { Calendar, LucideIcon, SquareChartGantt, User } from "lucide-react";
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
  {
    label: "排班计划",
    icon: SquareChartGantt,
    href: "/management/schedule-plans",
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
              isActive={
                location.pathname.split("/")[2] === item.href.split("/")[2]
              }
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
