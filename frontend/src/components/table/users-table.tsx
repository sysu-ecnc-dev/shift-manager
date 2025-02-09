import DataTable from "@/components/table/data-table";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUsers } from "@/lib/api";
import { User } from "@/lib/types";
import {
  IconArrowBadgeDown,
  IconBadge,
  IconMilitaryRank,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import UpdateUserRoleDialog from "@/components/dialog/update-user-role-dialog";
import UpdateStatusDialog from "@/components/dialog/update-status-dialog";

export default function UsersTable() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [openUpdateUserRoleDialog, setOpenUpdateUserRoleDialog] =
    useState(false);
  const [openUpdateStatusDialog, setOpenUpdateStatusDialog] = useState(false);
  // 表格列定义
  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        title: "选择",
      },
    },
    {
      id: "username",
      accessorKey: "username",
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      meta: {
        title: "用户名",
      },
    },
    {
      id: "fullName",
      accessorKey: "fullName",
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      meta: {
        title: "姓名",
      },
    },
    {
      id: "email",
      accessorKey: "email",
      enableHiding: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      meta: {
        title: "邮箱",
      },
    },
    {
      id: "role",
      accessorKey: "role",
      enableHiding: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const role = row.getValue("role") as string;

        const roleIcons = {
          普通助理: <IconArrowBadgeDown size={20} />,
          资深助理: <IconBadge size={20} />,
          黑心: <IconMilitaryRank size={20} />,
        };

        return (
          <div className="flex gap-2 items-center">
            {roleIcons[role as keyof typeof roleIcons]}
            <span>{role}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      meta: {
        title: "角色",
        options: [
          { label: "普通助理", value: "普通助理", icon: IconArrowBadgeDown },
          { label: "资深助理", value: "资深助理", icon: IconBadge },
          { label: "黑心", value: "黑心", icon: IconMilitaryRank },
        ],
      },
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      enableHiding: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;

        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "在职" : "离职"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value
          .map((v: string) =>
            v === "true" ? true : v === "false" ? false : null
          )
          .includes(row.getValue(id));
      },
      meta: {
        title: "状态",
        options: [
          { label: "在职", value: "true" },
          { label: "离职", value: "false" },
        ],
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      enableHiding: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const createdTime = row.getValue("createdAt") as Date;
        const formattedDate = format(createdTime, "yyyy-MM-dd EEEE", {
          locale: zhCN,
        });

        return formattedDate;
      },
      meta: {
        title: "创建时间",
      },
    },
    {
      id: "operation",
      enableHiding: false,
      cell: ({ row }) => {
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
                  setCurrentUser(row.original);
                  setOpenUpdateUserRoleDialog(true);
                }}
              >
                更改角色
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentUser(row.original);
                  setOpenUpdateStatusDialog(true);
                }}
              >
                更改状态
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                删除用户
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // 获取用户列表
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers().then((res) => res.data.data),
  });

  if (isPending) return null;

  if (isError) {
    toast.error(error.message);
    return null;
  }

  return (
    <>
      <div className="container mx-auto mt-2">
        <DataTable
          columns={columns}
          data={data}
          globalSearchPlaceholder="搜索用户..."
        />
      </div>
      {currentUser && (
        <UpdateUserRoleDialog
          open={openUpdateUserRoleDialog}
          onOpenChange={setOpenUpdateUserRoleDialog}
          user={currentUser}
        />
      )}
      {currentUser && (
        <UpdateStatusDialog
          open={openUpdateStatusDialog}
          onOpenChange={setOpenUpdateStatusDialog}
          user={currentUser}
        />
      )}
    </>
  );
}
