import { SchedulePlan } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteSchedulePlan } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PendingButton } from "@/components/pending-button";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedulePlan: SchedulePlan;
}

export default function DeleteSchedulePlanDialog({
  open,
  onOpenChange,
  schedulePlan,
}: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteSchedulePlan(schedulePlan.id).then((res) => res.data),
    onSuccess: () => {
      queryClient.setQueryData(["schedule-plans"], (old: SchedulePlan[]) =>
        old.filter((plan) => plan.id !== schedulePlan.id)
      );
      toast.success("删除成功");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除排班计划</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除{schedulePlan.name}吗？
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
