import { getUsersQueryOptions } from "@/lib/queryOptions";
import { getAllSubmissionsQueryOptions } from "@/lib/queryOptions";
import { SchedulePlan } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HTMLAttributes } from "react";

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

  return (
    <div
      className={cn(
        className,
        "border-2 border-border rounded-md mt-2 grid grid-cols-2 gap-2 p-2"
      )}
    >
      {submissions.map((submission) => {
        return (
          <div key={submission.id}>
            {users.find((user) => user.id === submission.userID)?.fullName}
          </div>
        );
      })}
    </div>
  );
}
