import SchedulingAreaTable from "@/feat/scheduling-area/scheduling-area-table";
import SchedulingAreaUsers from "@/feat/scheduling-area/scheduling-area-users";
import { SchedulePlan, User } from "@/lib/types";
import useSchedulingSubmissionStore from "@/store/use-scheduling-submission-store";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

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
          className="flex-1 self-start text-md"
        />
        {/* 助理列表 */}
        <SchedulingAreaUsers schedulePlan={schedulePlan} className="text-md" />
      </div>
    </DndContext>
  );
}
