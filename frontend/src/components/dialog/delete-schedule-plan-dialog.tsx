import { PendingButton } from "@/components/pending-button";
import { Button } from "@/components/ui/button";
import { deleteSchedulePlan } from "@/lib/api";
import { SchedulePlan } from "@/lib/types";
import useDeleteSchedulePlanDialogStore from "@/store/use-delete-schedule-plan-dialog";
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

export default function DeleteSchedulePlanDialog() {
  const { open, setOpen, schedulePlan } = useDeleteSchedulePlanDialogStore();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteSchedulePlan(schedulePlan!.id).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["schedule-plans"], (old: SchedulePlan[]) =>
        old.filter((plan) => plan.id !== schedulePlan!.id)
      );
      toast.success(res.message);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除排班计划</DialogTitle>
          <DialogDescription>
            你确定要删除{schedulePlan?.name}吗？
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
