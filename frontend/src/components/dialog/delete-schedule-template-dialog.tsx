import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { deleteScheduleTemplate } from "@/lib/api";
import { ScheduleTemplateMeta } from "@/lib/types";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/pending-button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleTemplateId: number;
}

export default function DeleteScheduleTemplateDialog({
  open,
  onOpenChange,
  scheduleTemplateId,
}: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteScheduleTemplate(scheduleTemplateId).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(
        ["schedule-templates"],
        (old: ScheduleTemplateMeta[]) =>
          old.filter((s) => s.id !== scheduleTemplateId)
      );
      toast.success(res.message);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const scheduleTemplateMeta = (
    queryClient.getQueryData(["schedule-templates"]) as ScheduleTemplateMeta[]
  ).find((template) => template.id === scheduleTemplateId);

  if (!scheduleTemplateMeta) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除模板</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除{scheduleTemplateMeta.name}吗?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          {deleteMutation.isPending ? (
            <PendingButton />
          ) : (
            <Button onClick={() => deleteMutation.mutate()}>删除</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
