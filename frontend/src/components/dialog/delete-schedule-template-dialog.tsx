import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { deleteScheduleTemplate } from "@/lib/api";
import { ScheduleTemplate } from "@/lib/types";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/pending-button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleTemplate: ScheduleTemplate;
}

export default function DeleteScheduleTemplateDialog({
  open,
  onOpenChange,
  scheduleTemplate,
}: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteScheduleTemplate(scheduleTemplate.id).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(
        ["schedule-templates"],
        (old: ScheduleTemplate[]) =>
          old.filter((s) => s.id !== scheduleTemplate.id)
      );
      toast.success(res.message);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除模板</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除{scheduleTemplate.name}吗?
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
