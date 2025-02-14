import EditSchedulePlanForm from "@/components/form/edit-schedule-plan-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useEditSchedulePlanDialogStore from "@/store/use-edit-schedule-plan-dialog-store";

export default function EditSchedulePlanDialog() {
  const { open, setOpen, schedulePlan } = useEditSchedulePlanDialogStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑排班计划</DialogTitle>
          <DialogDescription>
            在下方编辑{schedulePlan?.name}的信息
          </DialogDescription>
        </DialogHeader>
        <EditSchedulePlanForm />
      </DialogContent>
    </Dialog>
  );
}
