import SchedulingTable from "@/feat/scheduling-area/scheduling-table";
import { SchedulePlan } from "@/lib/types";

interface Props {
  schedulePlan: SchedulePlan;
}

export default function SchedulingArea({ schedulePlan }: Props) {
  return (
    <div>
      {/* 排班表 */}
      <SchedulingTable schedulePlan={schedulePlan} />
      {/* 助理列表 */}
    </div>
  );
}
