import { DayOfWeek } from "@/lib/const";
import {
  SchedulePlan,
  ScheduleTemplateShift,
  SchedulingResultShift,
} from "@/lib/types";
import SchedulingAreaTableRowCell from "@/feat/scheduling-area/scheduling-area-table-row-cell";

interface Props {
  templateShift: ScheduleTemplateShift;
  resultShift: SchedulingResultShift;
  schedulePlan: SchedulePlan;
}

export default function SchedulingAreaTableRow({
  templateShift,
  resultShift,
  schedulePlan,
}: Props) {
  return (
    <div className="grid grid-cols-8 divide-x divide-border">
      {/* 班次情况 */}
      <div className="grid grid-rows-9 text-center">
        <div className="row-start-4">{templateShift.startTime}</div>
        <div className="row-start-5">~</div>
        <div className="row-start-6">{templateShift.endTime}</div>
      </div>

      {/* 每天的排班情况 */}
      {DayOfWeek.map((day) => {
        const item = resultShift.items.find((item) => item.day === day.key);

        if (item === undefined) {
          return (
            <div
              className="h-full flex items-center justify-center text-muted-foreground"
              key={day.key}
            >
              不可排班
            </div>
          );
        }

        return (
          <SchedulingAreaTableRowCell
            key={day.key}
            shiftID={templateShift.id}
            resultShiftItem={item}
            requiredAssistantNumber={templateShift.requiredAssistantNumber}
            schedulePlan={schedulePlan}
          />
        );
      })}
    </div>
  );
}
