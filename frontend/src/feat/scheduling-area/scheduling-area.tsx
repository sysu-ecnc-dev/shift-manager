import SchedulingAreaTable from "@/feat/scheduling-area/scheduling-area-table";
import SchedulingAreaUsers from "@/feat/scheduling-area/scheduling-area-users";
import { SchedulePlan } from "@/lib/types";
import { DndContext } from "@dnd-kit/core";

interface Props {
  schedulePlan: SchedulePlan;
}

export default function SchedulingArea({ schedulePlan }: Props) {
  return (
    <DndContext>
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
