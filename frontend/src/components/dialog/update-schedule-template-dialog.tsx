import UpdateScheduleTemplateForm from "@/components/form/update-schedule-template-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScheduleTemplate } from "@/lib/types";
import { DialogTitle } from "@radix-ui/react-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleTemplate: ScheduleTemplate;
}

export default function UpdateScheduleTemplateDialog({
  open,
  onOpenChange,
  scheduleTemplate,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更新班表模板</DialogTitle>
          <DialogDescription>
            在这里修改{scheduleTemplate.name}的名称或描述
          </DialogDescription>
        </DialogHeader>
        <UpdateScheduleTemplateForm
          originalScheduleTemplate={scheduleTemplate}
          onDialogOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
