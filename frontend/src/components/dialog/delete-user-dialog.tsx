import { User } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useDeleteUserDialogStore from "@/store/use-delete-user-dialog-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function DeleteUserDialog() {
  const { open, setOpen, user } = useDeleteUserDialogStore();
  const queryClient = useQueryClient();
  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUser(user!.id).then((res) => res.data),
    onSuccess: (res) => {
      queryClient.setQueryData(["users"], (old: User[]) =>
        old.filter((u) => u.id !== user!.id)
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
          <DialogTitle>删除用户</DialogTitle>
          <DialogDescription>
            你确定要删除用户{user?.fullName}({user?.username})吗？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={deleteUserMutation.isPending}
            onClick={() => deleteUserMutation.mutate()}
          >
            {deleteUserMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                请稍等
              </>
            ) : (
              "确定"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
