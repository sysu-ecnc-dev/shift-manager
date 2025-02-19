import SchedulingAreaTable from "@/feat/scheduling-area/scheduling-area-table";
import { SchedulePlan } from "@/lib/types";
import SchedulingAreaUsers from "@/feat/scheduling-area/scheduling-area-users";

interface Props {
  schedulePlan: SchedulePlan;
}

export default function SchedulingArea({ schedulePlan }: Props) {
  return (
    <div className="flex gap-4">
      {/* 排班表 */}
      <SchedulingAreaTable
        schedulePlan={schedulePlan}
        className="flex-1 self-start"
      />
      {/* 助理列表 */}
      <SchedulingAreaUsers schedulePlan={schedulePlan} />
    </div>
  );
}
