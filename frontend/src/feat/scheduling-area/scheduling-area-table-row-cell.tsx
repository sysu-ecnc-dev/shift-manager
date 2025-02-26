import { SchedulePlan, SchedulingResultShiftItem } from "@/lib/types";
import SchedulingAreaTableRowCellItem from "@/feat/scheduling-area/scheduling-area-table-row-cell-item";
import useSchedulingSubmissionStore from "@/store/use-scheduling-submission-store";

interface Props {
  shiftID: number;
  resultShiftItem: SchedulingResultShiftItem;
  requiredAssistantNumber: number;
  schedulePlan: SchedulePlan;
}

export default function SchedulingAreaTableRowCell({
  shiftID,
  resultShiftItem,
  requiredAssistantNumber,
  schedulePlan,
}: Props) {
  const { schedulingSubmission, setSchedulingSubmission } = useSchedulingSubmissionStore();

  const onRemoveBadge = () => {
    var submission = schedulingSubmission;
    for (let i = 0; i < submission.length; i++) {
      if (submission[i].shiftID === shiftID) {
        for (let j = 0; j < submission[i].items.length; j++) {
          if (submission[i].items[j].day === resultShiftItem.day) {
            if (resultShiftItem.principalID === submission[i].items[j].principalID) {
              submission[i].items[j].principalID = null;
            } else if (resultShiftItem.principalID) {
              const index = submission[i].items[j].assistantIDs.indexOf(resultShiftItem.principalID);
              if (index !== -1) {
                submission[i].items[j].assistantIDs.splice(index, 1);
              }
            }
          }
        }
      }
    }
    setSchedulingSubmission(submission);
  }

  return (
    <div className="grid gap-2 p-2">
      {/* 负责人 */}
      <SchedulingAreaTableRowCellItem
        isPrincipal={true}
        shiftID={shiftID}
        day={resultShiftItem.day}
        schedulingResultShiftItem={resultShiftItem}
        schedulePlan={schedulePlan}
        onRemoveBadge={onRemoveBadge}
      />
      {/* 助理，这里 -1 表示减去负责人 */}
      {Array.from({ length: requiredAssistantNumber - 1 }).map((_, index) => (
        <SchedulingAreaTableRowCellItem
          isPrincipal={false}
          shiftID={shiftID}
          day={resultShiftItem.day}
          schedulingResultShiftItem={resultShiftItem}
          index={index}
          key={index}
          schedulePlan={schedulePlan}
          onRemoveBadge={onRemoveBadge}
        />
      ))}
    </div>
  );
}
