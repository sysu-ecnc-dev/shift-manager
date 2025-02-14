import DataTable from "@/components/table/data-table";
import { schedulePlansTableColumns } from "@/components/table/schedule-plans-table-columns";
import { SchedulePlan, ScheduleTemplate } from "@/lib/types";

interface Props {
  schedulePlans: SchedulePlan[];
  scheduleTemplates: ScheduleTemplate[];
}

export default function SchedulePlansTable({
  schedulePlans,
  scheduleTemplates,
}: Props) {
  return (
    <div className="my-2">
      <DataTable
        columns={schedulePlansTableColumns}
        data={schedulePlans.map((schedulePlan) => ({
          ...schedulePlan,
          scheduleTemplate: scheduleTemplates.find(
            (scheduleTemplate) =>
              scheduleTemplate.id === schedulePlan.scheduleTemplateID
          ),
        }))}
        globalSearchPlaceholder="搜索排班计划..."
      />
    </div>
  );
}
