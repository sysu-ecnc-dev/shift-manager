import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AddSchedulePlanForm from "@/components/form/add-schedule-plan-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddSchedulePlanDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加排班计划</DialogTitle>
          <DialogDescription>
            在这里添加新的排班计划以进行排班
          </DialogDescription>
        </DialogHeader>
        <AddSchedulePlanForm onDialogOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
