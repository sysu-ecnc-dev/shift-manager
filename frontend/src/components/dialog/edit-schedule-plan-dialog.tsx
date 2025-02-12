import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SchedulePlan } from "@/lib/types";
import EditSchedulePlanForm from "@/components/form/edit-schedule-plan-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedulePlan: SchedulePlan;
}

export default function EditSchedulePlanDialog({
  open,
  onOpenChange,
  schedulePlan,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑排班计划</DialogTitle>
          <DialogDescription>
            在下方编辑{schedulePlan.name}的信息
          </DialogDescription>
        </DialogHeader>
        <EditSchedulePlanForm
          schedulePlan={schedulePlan}
          onDialogOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
