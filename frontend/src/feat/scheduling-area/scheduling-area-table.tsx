import SchedulingAreaTableRow from "@/feat/scheduling-area/scheduling-area-table-row";
import { DayOfWeek } from "@/lib/const";
import {
  getScheduleTemplateQueryOptions,
  getSchedulingResultQueryOptions,
} from "@/lib/queryOptions";
import { SchedulePlan } from "@/lib/types";
import { cn } from "@/lib/utils";
import useSchedulingSubmissionStore from "@/store/use-scheduling-submission-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HTMLAttributes, useEffect } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  schedulePlan: SchedulePlan;
}

export default function SchedulingAreaTable({
  className,
  schedulePlan,
}: Props) {
  const { data: scheduleTemplate } = useSuspenseQuery(
    getScheduleTemplateQueryOptions(schedulePlan.scheduleTemplateID)
  );

  const { data: schedulingResult } = useSuspenseQuery(
    getSchedulingResultQueryOptions(schedulePlan.id)
  );

  const { schedulingSubmission, setSchedulingSubmission } =
    useSchedulingSubmissionStore();

  useEffect(() => {
    setSchedulingSubmission(schedulingResult?.shifts ?? []);
  }, [schedulingResult, setSchedulingSubmission]);

  return (
    <div
      className={cn(
        "mt-2 border-2 border-border rounded-md grid divide-y divide-border",
        className
      )}
    >
      {/* 展示星期 */}
      <div className="grid grid-cols-8 font-bold text-center divide-x divide-border">
        {[{ key: 0, label: "班次" }, ...DayOfWeek].map((day) => (
          <div key={day.key} className="py-2">
            {day.label}
          </div>
        ))}
      </div>
      {/* 展示班次 */}
      {scheduleTemplate.shifts
        .sort((a, b) => (a.startTime > b.startTime ? 1 : -1))
        .map((scheduleTemplateShift) => {
          const resultShift = schedulingSubmission.find(
            (shift) => shift.shiftID === scheduleTemplateShift.id
          );

          if (resultShift === undefined) {
            return null;
          }

          return (
            <SchedulingAreaTableRow
              key={scheduleTemplateShift.id}
              templateShift={scheduleTemplateShift}
              resultShift={resultShift}
            />
          );
        })}
    </div>
  );
}
