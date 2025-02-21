import { SchedulePlan, SchedulingResultShiftItem } from "@/lib/types";
import SchedulingAreaTableRowCellItem from "@/feat/scheduling-area/scheduling-area-table-row-cell-item";

interface Props {
  shiftID: number;
  resultShiftItem: SchedulingResultShiftItem;
  requiredAssistantNumber: number;
  schedulePlan: SchedulePlan;
}

export default function SchedulingAreaTableRowCell({
  shiftID,
  resultShiftItem,
  requiredAssistantNumber,
  schedulePlan,
}: Props) {
  return (
    <div className="grid gap-2 p-2">
      {/* 负责人 */}
      <SchedulingAreaTableRowCellItem
        isPrincipal={true}
        shiftID={shiftID}
        day={resultShiftItem.day}
        schedulingResultShiftItem={resultShiftItem}
        schedulePlan={schedulePlan}
      />
      {/* 助理，这里 -1 表示减去负责人 */}
      {Array.from({ length: requiredAssistantNumber - 1 }).map((_, index) => (
        <SchedulingAreaTableRowCellItem
          isPrincipal={false}
          shiftID={shiftID}
          day={resultShiftItem.day}
          schedulingResultShiftItem={resultShiftItem}
          index={index}
          key={index}
          schedulePlan={schedulePlan}
        />
      ))}
    </div>
  );
}
