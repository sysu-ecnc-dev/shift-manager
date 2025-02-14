import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import useEditUserDialogStore from "@/store/use-edit-user-dialog-store";
import useChangeUserPasswordDialogStore from "@/store/use-change-user-password-dialog-store";
import useDeleteUserDialogStore from "@/store/use-delete-user-dialog-store";

interface Props {
  user: User;
}

export default function UsersTableOperationCell({ user }: Props) {
  const { setOpen: setEditUserDialogOpen, setUser: setEditUserDialogUser } =
    useEditUserDialogStore();
  const {
    setOpen: setChangeUserPasswordDialogOpen,
    setUser: setChangeUserPasswordDialogUser,
  } = useChangeUserPasswordDialogStore();
  const { setOpen: setDeleteUserDialogOpen, setUser: setDeleteUserDialogUser } =
    useDeleteUserDialogStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>操作</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            setEditUserDialogOpen(true);
            setEditUserDialogUser(user);
          }}
        >
          编辑用户
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setChangeUserPasswordDialogOpen(true);
            setChangeUserPasswordDialogUser(user);
          }}
        >
          修改密码
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            setDeleteUserDialogOpen(true);
            setDeleteUserDialogUser(user);
          }}
        >
          删除用户
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
