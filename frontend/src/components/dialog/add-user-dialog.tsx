import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateUserForm from "@/components/form/create-user-form";

interface props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUserDialog({ open, onOpenChange }: props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加用户</DialogTitle>
          <DialogDescription>
            添加用户后，用户名和密码会以邮件的形式发送到用户邮箱中
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm onDialogOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
