import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { LucideIcon, User, Wrench } from "lucide-react";

const navItems: {
  label: string;
  icon: LucideIcon;
  to: string;
}[] = [
  {
    label: "个人信息",
    icon: User,
    to: "/settings",
  },
  {
    label: "账户设置",
    icon: Wrench,
    to: "/settings/account",
  },
];

export default function SettingNav() {
  const { location } = useRouterState();

  return (
    <div className="flex flex-col gap-4 mr-4 w-48">
      {navItems.map((item) => (
        <Link
          to={item.to}
          className={cn(
            "flex items-center gap-4 rounded-md py-2 px-4",
            location.pathname === item.to && "bg-muted"
          )}
        >
          <item.icon className="w-4 h-4" />
          <span className="text-sm hover:underline underline-offset-2">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
