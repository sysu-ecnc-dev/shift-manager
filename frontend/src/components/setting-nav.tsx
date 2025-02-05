import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { KeyRound, LucideIcon, Mail } from "lucide-react";

const navItems: {
  label: string;
  icon: LucideIcon;
  to: string;
}[] = [
  {
    label: "更改邮箱",
    icon: Mail,
    to: "/settings",
  },
  {
    label: "修改密码",
    icon: KeyRound,
    to: "/settings/update-password",
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
