import DataTable from "@/components/table/data-table";
import { scheduleTemplatesTableColumns } from "@/components/table/schedule-templates-table-columns";
import { ScheduleTemplate } from "@/lib/types";

interface Props {
  scheduleTemplates: ScheduleTemplate[];
}

export default function ScheduleTemplatesTable({ scheduleTemplates }: Props) {
  return (
    <div className="my-2">
      <DataTable
        columns={scheduleTemplatesTableColumns}
        data={scheduleTemplates}
        globalSearchPlaceholder="搜索班表模板..."
      />
    </div>
  );
}
