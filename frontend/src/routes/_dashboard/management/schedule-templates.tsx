import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import ScheduleTemplatesTable from "@/components/table/schedule-templates-table";
import { useState } from "react";
import AddScheduleTemplateDialog from "@/components/dialog/add-schedule-template-dialog";

export const Route = createFileRoute(
  "/_dashboard/management/schedule-templates"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = useState(false);

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
        <ScheduleTemplatesTable />
      </div>
      <AddScheduleTemplateDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
