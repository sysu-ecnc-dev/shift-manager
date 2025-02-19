import { DayOfWeek } from "@/lib/const";
import { ScheduleTemplateShift, SchedulingResultShift } from "@/lib/types";
import SchedulingAreaTableRowCell from "@/feat/scheduling-area/scheduling-area-table-row-cell";

interface Props {
  templateShift: ScheduleTemplateShift;
  resultShift: SchedulingResultShift;
}

export default function SchedulingAreaTableRow({
  templateShift,
  resultShift,
}: Props) {
  if (resultShift === undefined) {
    return;
  }

  return (
    <div className="grid grid-cols-8 divide-x divide-border">
      {/* 班次情况 */}
      <div className="flex items-center justify-center">
        {templateShift.startTime}~{templateShift.endTime}
      </div>

      {/* 每天的排班情况 */}
      {DayOfWeek.map((day) => {
        const item = resultShift.items.find((item) => item.day === day.key);

        if (item === undefined) {
          return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              不可排班
            </div>
          );
        }

        return (
          <SchedulingAreaTableRowCell
            key={day.key}
            item={item}
            requiredAssistantNumber={templateShift.requiredAssistantNumber}
          />
        );
      })}
    </div>
  );
}
