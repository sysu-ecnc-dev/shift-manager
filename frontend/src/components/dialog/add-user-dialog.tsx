import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddUserForm from "@/components/form/add-user-form";
import useCreateUserDialogStore from "@/store/use-add-user-dialog-store";

export default function AddUserDialog() {
  const { open, setOpen } = useCreateUserDialogStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加用户</DialogTitle>
          <DialogDescription>
            添加用户后，用户名和密码会以邮件的形式发送到用户邮箱中
          </DialogDescription>
        </DialogHeader>
        <AddUserForm />
      </DialogContent>
    </Dialog>
  );
}
