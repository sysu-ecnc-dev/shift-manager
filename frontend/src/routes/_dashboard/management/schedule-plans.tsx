import AddSchedulePlanDialog from "@/components/dialog/add-schedule-plan-dialog";
import DeleteSchedulePlanDialog from "@/components/dialog/delete-schedule-plan-dialog";
import EditSchedulePlanDialog from "@/components/dialog/edit-schedule-plan-dialog";
import SchedulePlansTable from "@/components/table/schedule-plans-table";
import { Button } from "@/components/ui/button";
import {
  getSchedulePlansQueryOptions,
  getScheduleTemplatesQueryOptions,
} from "@/lib/queryOptions";
import useAddSchedulePlanDialogStore from "@/store/use-add-schedule-plan-dialog-store";
import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/management/schedule-plans")({
  loader: async ({ context }) =>
    await Promise.all([
      context.queryClient.ensureQueryData(getSchedulePlansQueryOptions()),
      context.queryClient.ensureQueryData(getScheduleTemplatesQueryOptions()),
    ]),
  component: RouteComponent,
});

function RouteComponent() {
  const { setOpen } = useAddSchedulePlanDialogStore();
  const [{ data: schedulePlans }, { data: scheduleTemplates }] =
    useSuspenseQueries({
      queries: [
        getSchedulePlansQueryOptions(),
        getScheduleTemplatesQueryOptions(),
      ],
    });

  return (
    <>
      <div className="px-4 flex flex-col gap-2 mt-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">排班计划管理</h1>
            <span className="text-sm text-muted-foreground">
              在这里你可以新建排班计划或编辑已有排班计划
            </span>
          </div>
          <Button onClick={() => setOpen(true)}>添加排班计划</Button>
        </div>
        <SchedulePlansTable
          schedulePlans={schedulePlans}
          scheduleTemplates={scheduleTemplates}
        />
      </div>
      <AddSchedulePlanDialog scheduleTemplates={scheduleTemplates} />
      <EditSchedulePlanDialog />
      <DeleteSchedulePlanDialog />
    </>
  );
}
