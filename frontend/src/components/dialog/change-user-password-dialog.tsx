import useChangeUserPasswordDialogStore from "@/store/use-change-user-password-dialog-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChangeUserPasswordForm from "@/components/form/change-user-password-form";

export default function ChangeUserPasswordDialog() {
  const { open, setOpen } = useChangeUserPasswordDialogStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            当用户无论如何都无法登录时再使用该功能
          </DialogDescription>
        </DialogHeader>
        <ChangeUserPasswordForm />
      </DialogContent>
    </Dialog>
  );
}
