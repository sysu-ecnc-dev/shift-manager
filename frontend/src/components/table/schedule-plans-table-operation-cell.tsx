import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SchedulePlan } from "@/lib/types";
import useDeleteSchedulePlanDialogStore from "@/store/use-delete-schedule-plan-dialog";
import useEditSchedulePlanDialogStore from "@/store/use-edit-schedule-plan-dialog-store";
import { useNavigate } from "@tanstack/react-router";
import { MoreHorizontalIcon } from "lucide-react";

interface Props {
  schedulePlan: SchedulePlan;
}

export default function SchedulePlansTableOperationCell({
  schedulePlan,
}: Props) {
  const {
    setSchedulePlan: setEditSchedulePlanDialogSchedulePlan,
    setOpen: setEditSchedulePlanDialogOpen,
  } = useEditSchedulePlanDialogStore();
  const {
    setOpen: setDeleteSchedulePlanDialogOpen,
    setSchedulePlan: setDeleteSchedulePlanDialogSchedulePlan,
  } = useDeleteSchedulePlanDialogStore();

  const navigate = useNavigate();

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
            navigate({
              to: "/management/schedule-plans/$id/scheduling",
              params: {
                id: schedulePlan.id.toString(),
              },
            });
          }}
        >
          进行排班
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setEditSchedulePlanDialogSchedulePlan(schedulePlan);
            setEditSchedulePlanDialogOpen(true);
          }}
        >
          编辑排班计划
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            setDeleteSchedulePlanDialogSchedulePlan(schedulePlan);
            setDeleteSchedulePlanDialogOpen(true);
          }}
        >
          删除排班计划
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
