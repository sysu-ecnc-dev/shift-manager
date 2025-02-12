import { createFileRoute } from "@tanstack/react-router";
import EngageSchedulingForm from "@/components/form/engage-scheduling-form";
export const Route = createFileRoute("/_dashboard/engage-schedule-plan")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-4 grid gap-4 mt-8">
      {/* 页面标题 */}
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold">参与排班</h1>
        <span className="text-sm text-muted-foreground">
          在这里可以看到你可以参与的排班计划，请在此页面提交你的空闲时间
        </span>
      </div>
      {/* 提交空闲时间的表单 */}
      <div className="place-items-center">
        <EngageSchedulingForm />
      </div>
    </div>
  );
}
