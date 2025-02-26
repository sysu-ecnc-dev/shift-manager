import { BadgeRemovable } from "@/components/ui/badge-removable";
import {
  getScheduleTemplateQueryOptions,
  getUsersQueryOptions,
} from "@/lib/queryOptions";
import {
  AvailabilitySubmission,
  SchedulePlan,
  SchedulingResultShiftItem,
  User,
} from "@/lib/types";
import { calculateAssignedHours, cn } from "@/lib/utils";
import useSchedulingSubmissionStore from "@/store/use-scheduling-submission-store";
import { useDroppable } from "@dnd-kit/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CrownIcon, UserIcon } from "lucide-react";

interface Props {
  isPrincipal: boolean; // 表示这个 item 是否属于负责人
  shiftID: number;
  day: number;
  index?: number;
  schedulingResultShiftItem: SchedulingResultShiftItem;
  schedulePlan: SchedulePlan;
  onRemoveBadge: () => void;
}

export default function SchedulingAreaTableRowCellItem({
  isPrincipal,
  shiftID,
  day,
  index,
  schedulingResultShiftItem,
  schedulePlan,
  onRemoveBadge,
}: Props) {
  const { setNodeRef, active, isOver } = useDroppable({
    id: isPrincipal
      ? `principal-${shiftID}-${day}`
      : `assistant-${shiftID}-${day}-${index}`,
    data: {
      shiftID,
      day,
      isPrincipal,
      index,
    },
  });

  const { data: users } = useSuspenseQuery(getUsersQueryOptions());

  const { data: scheduleTemplate } = useSuspenseQuery(
    getScheduleTemplateQueryOptions(schedulePlan.scheduleTemplateID)
  );
  const { schedulingSubmission } = useSchedulingSubmissionStore();

  const activeSubmission = active?.data?.current?.submission as
    | AvailabilitySubmission
    | undefined;
  const activeUser = active?.data?.current?.user as User | undefined;

  let isAllowed =
    activeSubmission?.items
      .find((item) => item.shiftID === shiftID)
      ?.days.includes(day) &&
    activeUser &&
    schedulingResultShiftItem.principalID !== activeUser.id &&
    !schedulingResultShiftItem.assistantIDs.includes(activeUser.id);

  if (isPrincipal)
    isAllowed =
      isAllowed &&
      ((activeUser && activeUser.role === "资深助理") ||
        (activeUser && activeUser.role === "黑心"));

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-2 border-border rounded-md flex items-center justify-center py-2 text-md",
        isAllowed && "bg-chart-2",
        isOver && isAllowed && "bg-primary"
      )}
    >
      {isPrincipal ? (
        schedulingResultShiftItem.principalID !== null ? (
          <BadgeRemovable onRemove={onRemoveBadge} className="flex items-center gap-1 text-md">
            <CrownIcon className="w-4 h-4" />
            <span className="whitespace-nowrap">
              {
                users.find(
                  (user) => user.id === schedulingResultShiftItem.principalID
                )?.fullName
              }
            </span>
            <span className="select-none">
              (
              {calculateAssignedHours(
                schedulingResultShiftItem.principalID,
                schedulingSubmission,
                scheduleTemplate
              )}
              )
            </span>
          </BadgeRemovable>
        ) : (
          <span className="text-muted-foreground">缺少负责人</span>
        )
      ) : index !== undefined &&
        schedulingResultShiftItem.assistantIDs.at(index) !== undefined ? (
        <BadgeRemovable onRemove={onRemoveBadge} className="text-md flex items-center gap-1">
          <UserIcon className="w-4 h-4" />
          <span className="whitespace-nowrap">
            {
              users.find(
                (user) =>
                  user.id === schedulingResultShiftItem.assistantIDs.at(index)
              )?.fullName
            }
          </span>
          <span className="select-none">
            (
            {calculateAssignedHours(
              schedulingResultShiftItem.assistantIDs.at(index) ?? 0,
              schedulingSubmission,
              scheduleTemplate
            )}
            )
          </span>
        </BadgeRemovable>
      ) : (
        <span className="text-muted-foreground">缺少助理</span>
      )}
    </div>
  );
}
