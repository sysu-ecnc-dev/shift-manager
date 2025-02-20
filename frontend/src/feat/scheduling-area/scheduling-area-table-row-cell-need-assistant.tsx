import { AvailabilitySubmission, SchedulingResultShiftItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

interface Props {
  shiftID: number;
  day: number;
  index: number;
  item: SchedulingResultShiftItem;
}

export default function SchedulingAreaTableRowCellNeedAssistant({
  shiftID,
  day,
  index,
  item,
}: Props) {
  const { setNodeRef, active, isOver } = useDroppable({
    id: `${shiftID}-${day}-${index}`,
  });

  // active 是正在被拖拽的元素，我们需要它的 data 属性来判断它能否放置在当前单元格中
  const activeSubmission = active?.data?.current?.submission as
    | AvailabilitySubmission
    | undefined;

  const isAllowed =
    activeSubmission?.items.some((item) => item.days.includes(day)) &&
    item.principalID !== activeSubmission.userID &&
    !item.assistantIDs.includes(activeSubmission.userID);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "text-muted-foreground border border-border border-dashed rounded-md py-1",
        isAllowed && "bg-secondary",
        isOver && isAllowed && "bg-primary"
      )}
    >
      缺少助理
    </div>
  );
}
