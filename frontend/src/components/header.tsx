import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import ThemeSwitch from "@/components/theme-switch";

export default function Header() {
  return (
    <header className="flex h-16 items-center gap-4 bg-background p-4 w-full">
      <SidebarTrigger variant="outline" />
      <Separator orientation="vertical" className="h-6" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>ECNC 假勤系统</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <ThemeSwitch />
      </div>
    </header>
  );
}
