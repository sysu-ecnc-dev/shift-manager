import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { toast } from "sonner";
import { getAllScheduleTemplates } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/table/data-table";
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
import { useState } from "react";
import ShowScheduleTemplateDetailDialog from "@/components/dialog/show-schedule-template-detail-dialog";
import UpdateScheduleTemplateDialog from "@/components/dialog/update-schedule-template-dialog";
import DeleteScheduleTemplateDialog from "@/components/dialog/delete-schedule-template-dialog";
import { ScheduleTemplate } from "@/lib/types";

export default function ScheduleTemplatesTable() {
  const [
    openShowScheduleTemplateDetailDialog,
    setOpenShowScheduleTemplateDetailDialog,
  ] = useState(false);
  const [scheduleTemplate, setScheduleTemplate] =
    useState<ScheduleTemplate | null>(null);
  const [
    openUpdateScheduleTemplateDialog,
    setOpenUpdateScheduleTemplateDialog,
  ] = useState(false);
  const [
    openDeleteScheduleTemplateDialog,
    setOpenDeleteScheduleTemplateDialog,
  ] = useState(false);

  // 表格列定义
  const columns: ColumnDef<ScheduleTemplate>[] = [
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
        title: "模板名称",
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
          <span className="text-muted-foreground">此模板无描述</span>
        );
      },
      meta: {
        title: "模板描述",
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
                  setScheduleTemplate(row.original);
                  setOpenShowScheduleTemplateDetailDialog(true);
                }}
              >
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setScheduleTemplate(row.original);
                  setOpenUpdateScheduleTemplateDialog(true);
                }}
              >
                编辑模板
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setScheduleTemplate(row.original);
                  setOpenDeleteScheduleTemplateDialog(true);
                }}
              >
                删除模板
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // 获取班表模板列表
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["schedule-templates"],
    queryFn: () => getAllScheduleTemplates().then((res) => res.data.data),
  });

  if (isPending) return null;

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
          globalSearchPlaceholder="搜索班表模板..."
        />
      </div>
      {scheduleTemplate && (
        <ShowScheduleTemplateDetailDialog
          open={openShowScheduleTemplateDetailDialog}
          onOpenChange={setOpenShowScheduleTemplateDetailDialog}
          scheduleTemplate={scheduleTemplate}
        />
      )}
      {scheduleTemplate && (
        <UpdateScheduleTemplateDialog
          open={openUpdateScheduleTemplateDialog}
          onOpenChange={setOpenUpdateScheduleTemplateDialog}
          scheduleTemplate={scheduleTemplate}
        />
      )}
      {scheduleTemplate && (
        <DeleteScheduleTemplateDialog
          open={openDeleteScheduleTemplateDialog}
          onOpenChange={setOpenDeleteScheduleTemplateDialog}
          scheduleTemplate={scheduleTemplate}
        />
      )}
    </>
  );
}
