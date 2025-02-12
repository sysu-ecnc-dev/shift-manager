import SchedulePlansTable from "@/components/table/schedule-plans-table";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AddSchedulePlanDialog from "@/components/dialog/add-schedule-plan-dialog";

export const Route = createFileRoute("/_dashboard/management/schedule-plans")({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = useState(false);

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
        <SchedulePlansTable />
      </div>
      <AddSchedulePlanDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
