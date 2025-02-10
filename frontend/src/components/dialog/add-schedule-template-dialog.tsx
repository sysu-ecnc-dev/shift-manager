import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddScheduleTemplateForm from "@/components/form/add-schedule-template-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddScheduleTemplateDialog({
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加班表模板</DialogTitle>
          <DialogDescription>
            班表模板一旦被创建，就只能修改其名称和描述
          </DialogDescription>
        </DialogHeader>
        <AddScheduleTemplateForm onDialogOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
