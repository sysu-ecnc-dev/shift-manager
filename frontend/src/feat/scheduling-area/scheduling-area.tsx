import SchedulingAreaTable from "@/feat/scheduling-area/scheduling-area-table";
import SchedulingAreaUsers from "@/feat/scheduling-area/scheduling-area-users";
import { SchedulePlan, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import useSchedulingSubmissionStore from "@/store/use-scheduling-submission-store";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import SchedulingAreaDragOverlay from "@/feat/scheduling-area/scheduling-area-drag-overlay";

interface Props {
  schedulePlan: SchedulePlan;
}

export default function SchedulingArea({ schedulePlan }: Props) {
  const { schedulingSubmission, setSchedulingSubmission } =
    useSchedulingSubmissionStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over === null) return;

    const activeUser = active.data.current?.user as User | undefined;
    if (activeUser === undefined) return;

    const { shiftID, day, isPrincipal, index } = over.data.current as {
      shiftID: number;
      day: number;
      isPrincipal: boolean;
      index?: number;
    };

    setSchedulingSubmission(
      schedulingSubmission.map((resultShift) => {
        if (resultShift.shiftID !== shiftID) {
          return resultShift;
        }

        const newResultShift = { ...resultShift };

        newResultShift.items = newResultShift.items.map((resultShiftItem) => {
          if (resultShiftItem.day !== day) {
            return resultShiftItem;
          }

          const newResultShiftItem = { ...resultShiftItem };

          if (isPrincipal) {
            newResultShiftItem.principalID = activeUser.id;
          } else {
            newResultShiftItem.assistantIDs = [
              ...newResultShiftItem.assistantIDs,
            ];

            if (
              index !== undefined &&
              newResultShiftItem.assistantIDs.at(index) !== undefined
            ) {
              newResultShiftItem.assistantIDs[index] = activeUser.id;
            } else {
              newResultShiftItem.assistantIDs.push(activeUser.id);
            }
          }

          return newResultShiftItem;
        });

        return newResultShift;
      })
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {/* 排班表 */}
        <SchedulingAreaTable
          schedulePlan={schedulePlan}
          className="flex-1 self-start"
        />
        {/* 助理列表 */}
        <SchedulingAreaUsers
          schedulePlan={schedulePlan}
          className={cn(
            "overflow-y-auto max-h-screen top-2 bottom-2 sticky",
            "scrollbar scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-secondary-foreground scrollbar-track-secondary"
          )}
        />
      </div>
      <SchedulingAreaDragOverlay />
    </DndContext>
  );
}
