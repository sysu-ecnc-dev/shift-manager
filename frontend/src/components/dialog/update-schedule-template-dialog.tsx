import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScheduleTemplateMeta } from "@/lib/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import UpdateScheduleTemplateForm from "@/components/form/update-schedule-template-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleTemplateId: number;
}

export default function UpdateScheduleTemplateDialog({
  open,
  onOpenChange,
  scheduleTemplateId,
}: Props) {
  const queryClient = useQueryClient();
  const scheduleTemplateMeta = (
    queryClient.getQueryData(["schedule-templates"]) as ScheduleTemplateMeta[]
  ).find((template) => template.id === scheduleTemplateId);

  if (!scheduleTemplateMeta) {
    toast.error("班表模板不存在");
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更新班表模板</DialogTitle>
          <DialogDescription>
            在这里修改{scheduleTemplateMeta.name}的名称或描述
          </DialogDescription>
        </DialogHeader>
        <UpdateScheduleTemplateForm
          originalScheduleTemplate={scheduleTemplateMeta}
          onDialogOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
