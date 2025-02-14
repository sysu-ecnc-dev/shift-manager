import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/lib/types";
import {
  IconArrowBadgeDown,
  IconBadge,
  IconMilitaryRank,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import UsersTableOperationCell from "./users-table-operation-cell";

// 表格列定义
export const usersTableColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    enableHiding: false,
    meta: {
      title: "用户名",
    },
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    enableHiding: false,
    meta: {
      title: "姓名",
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    meta: {
      title: "邮箱",
    },
  },
  {
    accessorKey: "role",
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
    accessorKey: "isActive",
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
    accessorKey: "createdAt",
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
    cell: ({ row }) => {
      return <UsersTableOperationCell user={row.original} />;
    },
  },
];
