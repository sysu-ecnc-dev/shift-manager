import useEditUserDialogStore from "@/store/use-edit-user-dialog-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditUserForm from "@/components/form/edit-user-form";

export default function EditUserDialog() {
  const { open, setOpen, user } = useEditUserDialogStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
          <DialogDescription>
            在下方编辑{user?.fullName}({user?.username})的信息
          </DialogDescription>
        </DialogHeader>
        <EditUserForm />
      </DialogContent>
    </Dialog>
  );
}
