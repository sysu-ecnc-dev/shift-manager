import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/lib/types";
import UpdateUserRoleForm from "@/components/form/update-user-role-form";

interface props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function UpdateUserRoleDialog({
  open,
  onOpenChange,
  user,
}: props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>变更角色</DialogTitle>
          <DialogDescription>
            在这里你可以将用户的身份修改为普通助理、资深助理或黑心
          </DialogDescription>
        </DialogHeader>
        <UpdateUserRoleForm user={user} onDialogOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
