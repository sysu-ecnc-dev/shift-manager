import UpdateScheduleTemplateForm from "@/components/form/update-schedule-template-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useEditScheduleTemplateDialogStore from "@/store/use-edit-schedule-template-dialog-store";

export default function EditScheduleTemplateDialog() {
  const { open, setOpen, scheduleTemplate } =
    useEditScheduleTemplateDialogStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更新班表模板</DialogTitle>
          <DialogDescription>
            在这里修改{scheduleTemplate?.name}的名称或描述
          </DialogDescription>
        </DialogHeader>
        <UpdateScheduleTemplateForm />
      </DialogContent>
    </Dialog>
  );
}
