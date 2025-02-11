import DataTable from "@/components/table/data-table";
import { getSchedulePlans } from "@/lib/api";
import { SchedulePlan } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  IconAlarm,
  IconCalendarStats,
  IconCheck,
  IconClock,
  IconCoffee,
} from "@tabler/icons-react";

export default function SchedulePlansTable() {
  const columns: ColumnDef<SchedulePlan>[] = [
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
      id: "name",
      accessorKey: "name",
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      meta: {
        title: "计划名称",
      },
    },
    {
      id: "description",
      accessorKey: "description",
      enableHiding: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description.length > 0 ? (
          description
        ) : (
          <span className="text-muted-foreground">此计划无描述</span>
        );
      },
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
      enableHiding: true,
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
      enableHiding: true,
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
      meta: {
        title: "生效时间",
      },
    },
    {
      id: "scheduleTemplateName",
      accessorKey: "scheduleTemplateName",
      enableHiding: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      meta: {
        title: "排班模板",
      },
    },
    {
      id: "status",
      accessorKey: "status",
      enableHiding: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusIcons = {
          未开始: <IconClock size={20} />,
          开放提交: <IconAlarm size={20} />,
          排班中: <IconCalendarStats size={20} />,
          生效中: <IconCheck size={20} />,
          已结束: <IconCoffee size={20} />,
        };

        return (
          <div className="flex gap-2 items-center">
            {statusIcons[status as keyof typeof statusIcons]}
            <span>{status}</span>
          </div>
        );
      },
      meta: {
        title: "状态",
      },
    },
    {
      id: "operation",
      enableHiding: false,
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem>查看提交情况</DropdownMenuItem>
              <DropdownMenuItem>编辑排班计划</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                删除排班计划
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["schedule-plans"],
    queryFn: () => getSchedulePlans().then((res) => res.data.data),
  });

  if (isPending) {
    return null;
  }

  if (isError) {
    toast.error(error.message);
    return null;
  }

  return (
    <>
      <div className="my-2">
        <DataTable
          columns={columns}
          data={data}
          globalSearchPlaceholder="搜索排班计划..."
        />
      </div>
    </>
  );
}
