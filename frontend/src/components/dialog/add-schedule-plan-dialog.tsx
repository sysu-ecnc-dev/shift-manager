import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AddSchedulePlanForm from "@/components/form/add-schedule-plan-form";
import useAddSchedulePlanDialogStore from "@/store/use-add-schedule-plan-dialog-store";
import { ScheduleTemplate } from "@/lib/types";

interface Props {
  scheduleTemplates: ScheduleTemplate[];
}

export default function AddSchedulePlanDialog({ scheduleTemplates }: Props) {
  const { open, setOpen } = useAddSchedulePlanDialogStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加排班计划</DialogTitle>
          <DialogDescription>
            在这里添加新的排班计划以进行排班
          </DialogDescription>
        </DialogHeader>
        <AddSchedulePlanForm scheduleTemplates={scheduleTemplates} />
      </DialogContent>
    </Dialog>
  );
}
