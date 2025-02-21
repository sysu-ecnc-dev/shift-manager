import { Label } from "@/components/ui/label";
import {
  getAllSubmissionsQueryOptions,
  getScheduleTemplateQueryOptions,
  getUsersQueryOptions,
} from "@/lib/queryOptions";
import { SchedulePlan } from "@/lib/types";
import { calculateAssignedHours, cn } from "@/lib/utils";
import useSchedulingSubmissionStore from "@/store/use-scheduling-submission-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HTMLAttributes } from "react";
import SchedulingAreaUserBadge from "./scheduling-area-users-badge";

interface Props extends HTMLAttributes<HTMLDivElement> {
  schedulePlan: SchedulePlan;
}

export default function SchedulingAreaUsers({
  className,
  schedulePlan,
}: Props) {
  const { data: users } = useSuspenseQuery(getUsersQueryOptions());
  const { data: submissions } = useSuspenseQuery(
    getAllSubmissionsQueryOptions(schedulePlan.id)
  );
  const { schedulingSubmission } = useSchedulingSubmissionStore();
  const { data: scheduleTemplate } = useSuspenseQuery(
    getScheduleTemplateQueryOptions(schedulePlan.scheduleTemplateID)
  );

  // 对 submissions 进行排序
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const hoursA = calculateAssignedHours(
      a.userID,
      schedulingSubmission,
      scheduleTemplate
    );
    const hoursB = calculateAssignedHours(
      b.userID,
      schedulingSubmission,
      scheduleTemplate
    );
    return hoursB - hoursA; // 降序排序
  });

  // 计算工作时间方差
  const calculateHoursVariance = () => {
    const hours = sortedSubmissions.map((submission) =>
      calculateAssignedHours(
        submission.userID,
        schedulingSubmission,
        scheduleTemplate
      )
    );

    if (hours.length === 0) return 0;

    // 计算平均值
    const mean = hours.reduce((sum, hour) => sum + hour, 0) / hours.length;

    // 计算方差
    const variance =
      hours.reduce((sum, hour) => {
        const diff = hour - mean;
        return sum + diff * diff;
      }, 0) / hours.length;

    return Number(variance.toFixed(2));
  };

  return (
    <div
      className={cn(
        className,
        "border-2 border-border rounded-md mt-2 p-2",
        "max-h-[calc(100vh-200px)] overflow-y-auto sticky top-2",
        "scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-secondary-foreground scrollbar-track-secondary"
      )}
    >
      {/* 排班基本情况 */}
      <div className="flex items-center gap-2 text-lg mb-2">
        <Label>工作时间方差:</Label>
        <span className="font-medium">{calculateHoursVariance()}</span>
      </div>
      {/* 排班助理列表 */}
      <div className="grid gap-4">
        {sortedSubmissions.map((submission) => {
          const user = users.find((user) => user.id === submission.userID);

          if (user === undefined) {
            return null;
          }

          return (
            <SchedulingAreaUserBadge
              key={submission.id}
              user={user}
              assignedHours={calculateAssignedHours(
                user.id,
                schedulingSubmission,
                scheduleTemplate
              )}
              submission={submission}
            />
          );
        })}
      </div>
    </div>
  );
}
