import { ScheduleTemplate } from "@/lib/types";
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
import useShowScheduleTemplateDialogDetailsStore from "@/store/use-show-schedule-template-dialog-details-store";
import useEditScheduleTemplateDialogStore from "@/store/use-edit-schedule-template-dialog-store";
import useDeleteScheduleTemplateDialogStore from "@/store/use-delete-schedule-template-dialog-store";

interface Props {
  scheduleTemplate: ScheduleTemplate;
}

export default function ScheduleTemplatesTableOperationCell({
  scheduleTemplate,
}: Props) {
  const {
    setOpen: setShowScheduleTemplateDetailsDialogOpen,
    setScheduleTemplate: setShowScheduleTemplateDetailsDialogScheduleTemplate,
  } = useShowScheduleTemplateDialogDetailsStore();

  const {
    setOpen: setEditScheduleTemplateDialogOpen,
    setScheduleTemplate: setEditScheduleTemplateDialogScheduleTemplate,
  } = useEditScheduleTemplateDialogStore();

  const {
    setOpen: setDeleteScheduleTemplateDialogOpen,
    setScheduleTemplate: setDeleteScheduleTemplateDialogScheduleTemplate,
  } = useDeleteScheduleTemplateDialogStore();

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
            setShowScheduleTemplateDetailsDialogScheduleTemplate(
              scheduleTemplate
            );
            setShowScheduleTemplateDetailsDialogOpen(true);
          }}
        >
          查看详情
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setEditScheduleTemplateDialogScheduleTemplate(scheduleTemplate);
            setEditScheduleTemplateDialogOpen(true);
          }}
        >
          编辑模板
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            setDeleteScheduleTemplateDialogScheduleTemplate(scheduleTemplate);
            setDeleteScheduleTemplateDialogOpen(true);
          }}
        >
          删除模板
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
