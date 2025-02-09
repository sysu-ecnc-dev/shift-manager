import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { User } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "@/lib/api";
import { toast } from "sonner";
import { PendingButton } from "@/components/pending-button";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function DeleteUserDialog({ open, onOpenChange, user }: Props) {
  const queryClient = useQueryClient();
  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUser(user.id).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["users"], (old: User[]) =>
        old.filter((u) => u.id !== user.id)
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
          <AlertDialogTitle>删除用户</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除用户{user.fullName}({user.username})吗？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          {deleteUserMutation.isPending ? (
            <PendingButton />
          ) : (
            <Button onClick={() => deleteUserMutation.mutate()}>确定</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
