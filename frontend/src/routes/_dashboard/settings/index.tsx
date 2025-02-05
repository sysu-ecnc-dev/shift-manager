import ChangeEmailForm from "@/components/form/change-email-form";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">更改邮箱</h1>
        <span className="text-sm text-muted-foreground">
          个人邮箱默认为你的中山大学邮箱，邮箱能够用于找回密码，请确保你使用正确的个人邮箱
        </span>
      </div>
      <Separator className="my-4" />
      <ChangeEmailForm />
    </div>
  );
}
