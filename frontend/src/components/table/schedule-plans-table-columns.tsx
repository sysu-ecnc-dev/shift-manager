import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { SchedulePlan, ScheduleTemplate } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import SchedulePlansTableOperationCell from "@/components/table/schedule-plans-table-operation-cell";

export const schedulePlansTableColumns: ColumnDef<
  SchedulePlan & { scheduleTemplate?: ScheduleTemplate }
>[] = [
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
      title: "计划名称",
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
        <span className="text-muted-foreground">此计划无描述</span>
      );
    },
    enableHiding: true,
    meta: {
      title: "计划描述",
    },
  },
  {
    id: "submissionStartTime",
    accessorFn: (row) => ({
      start: row.submissionStartTime,
      end: row.submissionEndTime,
    }),
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => {
      const { start, end } = row.getValue("submissionStartTime") as {
        start: string;
        end: string;
      };

      const submissionStartTime = new Date(start);
      const submissionEndTime = new Date(end);

      const formattedStartDate = format(submissionStartTime, "yyyy-MM-dd", {
        locale: zhCN,
      });
      const formattedEndDate = format(submissionEndTime, "yyyy-MM-dd", {
        locale: zhCN,
      });

      return `${formattedStartDate} ~ ${formattedEndDate}`;
    },
    enableHiding: true,
    meta: {
      title: "提交时间",
    },
  },
  {
    id: "activeTime",
    accessorFn: (row) => ({
      start: row.activeStartTime,
      end: row.activeEndTime,
    }),
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => {
      const { start, end } = row.getValue("activeTime") as {
        start: string;
        end: string;
      };

      const activeStartTime = new Date(start);
      const activeEndTime = new Date(end);

      const formattedStartDate = format(activeStartTime, "yyyy-MM-dd", {
        locale: zhCN,
      });
      const formattedEndDate = format(activeEndTime, "yyyy-MM-dd", {
        locale: zhCN,
      });

      return `${formattedStartDate} ~ ${formattedEndDate}`;
    },
    enableHiding: true,
    meta: {
      title: "生效时间",
    },
  },
  {
    id: "scheduleTemplateName",
    accessorFn: (row) => row.scheduleTemplate?.name,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => {
      const scheduleTemplateName = row.getValue("scheduleTemplateName") as
        | string
        | undefined;
      return scheduleTemplateName ? scheduleTemplateName : "-";
    },
    enableHiding: true,
    meta: {
      title: "排班模板名称",
    },
  },
  {
    id: "operation",
    cell: ({ row }) => (
      <SchedulePlansTableOperationCell schedulePlan={row.original} />
    ),
    enableHiding: false,
  },
];
