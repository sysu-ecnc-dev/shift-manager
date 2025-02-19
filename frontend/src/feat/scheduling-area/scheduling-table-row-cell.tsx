import { getUsersQueryOptions } from "@/lib/queryOptions";
import { SchedulingResultShiftItem } from "@/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CrownIcon } from "lucide-react";

interface Props {
  item: SchedulingResultShiftItem;
  requiredAssistantNumber: number;
}

export default function SchedulingTableRowCell({
  item,
  requiredAssistantNumber,
}: Props) {
  const { data: users } = useSuspenseQuery(getUsersQueryOptions());

  return (
    <div className="text-center grid gap-2 p-2">
      {/* 展示负责人 */}
      <div>
        {item.principalID === null ? (
          <div className="text-muted-foreground border border-border border-dashed rounded-md py-1">
            缺少负责人
          </div>
        ) : (
          <div className="border border-border rounded-md py-1 flex items-center gap-2 justify-center">
            <CrownIcon className="w-4 h-4" />
            {users.find((user) => user.id === item.principalID)?.fullName}
          </div>
        )}
      </div>
      {/* 展示助理 */}
      <div className="grid gap-2">
        {item.assistantIDs.map((id) => {
          return (
            <div key={id} className="border border-border rounded-md py-1">
              {users.find((user) => user.id === id)?.fullName}
            </div>
          );
        })}
        {Array.from({
          length: requiredAssistantNumber - item.assistantIDs.length - 1, // 减去负责人
        }).map((_, index) => (
          <div
            key={index}
            className="text-muted-foreground border border-border border-dashed rounded-md py-1"
          >
            缺少助理
          </div>
        ))}
      </div>
    </div>
  );
}
