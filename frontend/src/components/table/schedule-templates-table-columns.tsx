import { ScheduleTemplate } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import ScheduleTemplatesTableOperationCell from "@/components/table/schedule-templates-table-operation-cell";

export const scheduleTemplatesTableColumns: ColumnDef<ScheduleTemplate>[] = [
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
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    enableHiding: false,
    meta: {
      title: "模板名称",
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return description.length > 0 ? (
        description
      ) : (
        <span className="text-muted-foreground">此模板无描述</span>
      );
    },
    meta: {
      title: "模板描述",
    },
  },
  {
    id: "shiftsNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => {
      const shiftsNumber = row.original.shifts.length;
      return shiftsNumber;
    },
    meta: {
      title: "班次数量",
    },
  },
  {
    id: "assistantTotalNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => {
      const assistantTotalNumber = row.original.shifts.reduce(
        (acc, shift) => acc + shift.requiredAssistantNumber,
        0
      );
      return assistantTotalNumber;
    },
    meta: {
      title: "总助理人数",
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
      return (
        <ScheduleTemplatesTableOperationCell scheduleTemplate={row.original} />
      );
    },
    enableHiding: false,
  },
];
