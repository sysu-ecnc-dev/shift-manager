import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/engage-schedule-plan")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="px-4 flex flex-col gap-2 mt-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">参与排班</h1>
            <span className="text-sm text-muted-foreground">
              在这里可以看到你可以参与的排班计划，请在此页面提交你的空闲时间
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
