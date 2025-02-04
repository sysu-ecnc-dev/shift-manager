import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 ">
        <h1 className="text-xl font-bold">个人信息</h1>
        <span className="text-sm text-muted-foreground">
          目前仅支持修改个人邮箱，邮箱能用于找回密码
        </span>
        <Separator className="my-2" />
      </div>
      <form className="flex flex-col gap-2">
        <span>邮箱</span>
        <Input className="w-1/2" />
        <div className="text-muted-foreground text-sm">
          个人邮箱默认为你的中山大学邮箱，邮箱能够用于找回密码，请确保你使用正确的个人邮箱。
        </div>
        <div className="mt-2">
          <Button>更新邮箱</Button>
        </div>
      </form>
    </div>
  );
}
