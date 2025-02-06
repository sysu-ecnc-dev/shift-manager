import { Separator } from "@/components/ui/separator";
import UpdatePasswordForm from "@/components/form/update-password-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings/update-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">修改密码</h1>
        <span className="text-sm text-muted-foreground">
          在这里可以修改你的密码，请确保使用强密码
        </span>
      </div>
      <Separator className="my-4" />
      <UpdatePasswordForm />
    </div>
  );
}
