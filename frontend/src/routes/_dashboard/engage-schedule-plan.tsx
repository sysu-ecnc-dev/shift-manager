import EngageSchedulePlanCard from "@/components/card/engage-schedule-plan-card";
import {
  getLatestAvailablePlanQueryOptions,
  getScheduleTemplateQueryOptions,
  getYourSubmissionQueryOptions,
} from "@/lib/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/engage-schedule-plan")({
  loader: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData(
      getLatestAvailablePlanQueryOptions()
    );

    if (data) {
      await Promise.all([
        context.queryClient.ensureQueryData(
          getScheduleTemplateQueryOptions(data.scheduleTemplateID)
        ),
        context.queryClient.ensureQueryData(
          getYourSubmissionQueryOptions(data.id)
        ),
      ]);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: latestAvailableSchedulePlan } = useSuspenseQuery(
    getLatestAvailablePlanQueryOptions()
  );

  return (
    <div className="px-4 flex flex-col gap-4 pt-8 h-full">
      {/* 页面标题 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">参与排班</h1>
        <span className="text-sm text-muted-foreground">
          在这里可以看到你可以参与的排班计划，请在此页面提交你的空闲时间
        </span>
      </div>
      {/* 提交空闲时间的区域 */}
      {latestAvailableSchedulePlan ? (
        <div className="w-max mx-auto">
          <EngageSchedulePlanCard schedulePlan={latestAvailableSchedulePlan} />
        </div>
      ) : (
        <div className="flex-1 border border-border border-dashed flex items-center justify-center text-muted-foreground">
          暂无可参与的排班计划
        </div>
      )}
    </div>
  );
}
