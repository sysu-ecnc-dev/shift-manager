import { User } from "@/lib/types";

import { updateUser } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/pending-button";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function UpdateStatusDialog({
  open,
  onOpenChange,
  user,
}: Props) {
  const statusMap: Record<string, string> = {
    true: "在职",
    false: "离职",
  };

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: () =>
      updateUser(user.id, { isActive: !user.isActive }).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["users"], (old: User[]) =>
        old.map((user) => (user.id === res.data.id ? res.data : user))
      );
      toast.success(res.message);
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
          <AlertDialogTitle>更改状态</AlertDialogTitle>
          <AlertDialogDescription>
            {user.fullName}({user.username})目前的状态是"
            {statusMap[String(user.isActive)]}"，你要将其更改为"
            {statusMap[String(!user.isActive)]}"吗?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          {updateStatusMutation.isPending ? (
            <PendingButton />
          ) : (
            <Button onClick={() => updateStatusMutation.mutate()}>确定</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
