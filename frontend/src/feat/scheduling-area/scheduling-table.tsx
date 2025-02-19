import SchedulingTableRow from "@/feat/scheduling-area/scheduling-table-row";
import { DayOfWeek } from "@/lib/const";
import {
  getScheduleTemplateQueryOptions,
  getSchedulingResultQueryOptions,
} from "@/lib/queryOptions";
import { SchedulePlan, SchedulingResultShift } from "@/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

interface Props {
  schedulePlan: SchedulePlan;
}

export default function SchedulingTable({ schedulePlan }: Props) {
  const { data: scheduleTemplate } = useSuspenseQuery(
    getScheduleTemplateQueryOptions(schedulePlan.scheduleTemplateID)
  );

  const { data: schedulingResult } = useSuspenseQuery(
    getSchedulingResultQueryOptions(schedulePlan.id)
  );

  const [resultSubmission, setResultSubmission] = useState<
    SchedulingResultShift[]
  >(() => {
    return schedulingResult?.shifts ?? [];
  });

  return (
    <div className="mt-2 border border-border rounded-md grid divide-y divide-border">
      {/* 展示星期 */}
      <div className="grid grid-cols-8 font-bold text-center divide-x divide-border">
        {[{ key: 0, label: "班次" }, ...DayOfWeek].map((day) => (
          <div key={day.key} className="py-2">
            {day.label}
          </div>
        ))}
      </div>
      {/* 展示班次 */}
      {scheduleTemplate.shifts.map((scheduleTemplateShift) => {
        const resultShift = resultSubmission.find(
          (shift) => shift.shiftID === scheduleTemplateShift.id
        );

        if (resultShift === undefined) {
          return null;
        }

        return (
          <SchedulingTableRow
            key={scheduleTemplateShift.id}
            templateShift={scheduleTemplateShift}
            resultShift={resultShift}
          />
        );
      })}
    </div>
  );
}
