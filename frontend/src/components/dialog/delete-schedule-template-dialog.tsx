import { PendingButton } from "@/components/pending-button";
import { Button } from "@/components/ui/button";
import { deleteScheduleTemplate } from "@/lib/api";
import { ScheduleTemplate } from "@/lib/types";
import useDeleteScheduleTemplateDialogStore from "@/store/use-delete-schedule-template-dialog-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DeleteScheduleTemplateDialog() {
  const { open, setOpen, scheduleTemplate } =
    useDeleteScheduleTemplateDialogStore();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteScheduleTemplate(scheduleTemplate!.id).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(
        ["schedule-templates"],
        (old: ScheduleTemplate[]) =>
          old.filter((s) => s.id !== scheduleTemplate!.id)
      );
      toast.success(res.message);
      setOpen(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除模板</DialogTitle>
          <DialogDescription>
            你确定要删除{scheduleTemplate?.name}吗?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {deleteMutation.isPending ? (
            <PendingButton />
          ) : (
            <Button onClick={() => deleteMutation.mutate()}>删除</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
