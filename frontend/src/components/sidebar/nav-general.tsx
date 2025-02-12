import { Hand, House, LucideIcon } from "lucide-react";
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
    label: "主页",
    icon: House,
    href: "/",
  },
  {
    label: "参与排班",
    icon: Hand,
    href: "/engage-schedule-plan",
  },
];

export default function NavGeneral() {
  const { location } = useRouterState();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>通用</SidebarGroupLabel>
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
