import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddScheduleTemplateForm from "@/components/form/add-schedule-template-form";
import useAddScheduleTemplateDialogStore from "@/store/use-add-schedule-template-dialog-store";

export default function AddScheduleTemplateDialog() {
  const { open, setOpen } = useAddScheduleTemplateDialogStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加班表模板</DialogTitle>
          <DialogDescription>
            班表模板一旦被创建，就只能修改其名称和描述
          </DialogDescription>
        </DialogHeader>
        <AddScheduleTemplateForm />
      </DialogContent>
    </Dialog>
  );
}
