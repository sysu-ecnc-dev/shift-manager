import {
  getAllSubmissionsQueryOptions,
  getScheduleTemplateQueryOptions,
  getUsersQueryOptions,
} from "@/lib/queryOptions";
import { SchedulePlan } from "@/lib/types";
import { cn } from "@/lib/utils";
import useSchedulingSubmissionStore from "@/store/use-scheduling-submission-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { differenceInHours, parse } from "date-fns";
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

  return (
    <div
      className={cn(
        className,
        "border-2 border-border rounded-md mt-2 grid grid-cols-2 gap-2 p-2"
      )}
    >
      {submissions.map((submission) => {
        const user = users.find((user) => user.id === submission.userID);

        if (user === undefined) {
          return null;
        }

        return (
          <SchedulingAreaUserBadge
            key={submission.id}
            user={user}
            assignedHours={schedulingSubmission
              .filter((submissionShift) =>
                submissionShift.items.some(
                  (item) =>
                    item.principalID === user.id ||
                    item.assistantIDs.includes(user.id)
                )
              )
              .reduce((acc, shift) => {
                const shiftTemplate = scheduleTemplate.shifts.find(
                  (shiftTemplate) => shiftTemplate.id === shift.shiftID
                );

                if (shiftTemplate !== undefined) {
                  return (
                    acc +
                    differenceInHours(
                      parse(shiftTemplate.endTime, "HH:mm:ss", new Date()),
                      parse(shiftTemplate.startTime, "HH:mm:ss", new Date())
                    )
                  );
                }

                return acc;
              }, 0)}
            submission={submission}
          />
        );
      })}
    </div>
  );
}
