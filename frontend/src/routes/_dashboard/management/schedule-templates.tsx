import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import ScheduleTemplatesTable from "@/components/table/schedule-templates-table";
import AddScheduleTemplateDialog from "@/components/dialog/add-schedule-template-dialog";
import { getScheduleTemplatesQueryOptions } from "@/lib/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import useAddScheduleTemplateDialogStore from "@/store/use-add-schedule-template-dialog-store";
import ShowScheduleTemplateDetailsDialog from "@/components/dialog/show-schedule-template-details-dialog";
import EditScheduleTemplateDialog from "@/components/dialog/edit-schedule-template-dialog";
import DeleteScheduleTemplateDialog from "@/components/dialog/delete-schedule-template-dialog";
export const Route = createFileRoute(
  "/_dashboard/management/schedule-templates"
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(getScheduleTemplatesQueryOptions()),
  component: RouteComponent,
});

function RouteComponent() {
  const { setOpen } = useAddScheduleTemplateDialogStore();
  const { data } = useSuspenseQuery(getScheduleTemplatesQueryOptions());

  return (
    <>
      <div className="px-4 flex flex-col gap-2 mt-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">班表模板管理</h1>
            <span className="text-sm text-muted-foreground">
              在这里你可以新建班表模板或编辑已有班表模板
            </span>
          </div>
          <Button onClick={() => setOpen(true)}>添加班表模板</Button>
        </div>
        <ScheduleTemplatesTable scheduleTemplates={data} />
      </div>
      <AddScheduleTemplateDialog />
      <ShowScheduleTemplateDetailsDialog />
      <EditScheduleTemplateDialog />
      <DeleteScheduleTemplateDialog />
    </>
  );
}
