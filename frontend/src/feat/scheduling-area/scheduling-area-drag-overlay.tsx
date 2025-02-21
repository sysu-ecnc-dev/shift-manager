import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/types";
import { DragOverlay, useDndContext } from "@dnd-kit/core";
import { IconArrowBadgeDown } from "@tabler/icons-react";
import { IconMilitaryRank } from "@tabler/icons-react";
import { IconBadge } from "@tabler/icons-react";

export default function SchedulingAreaDragOverlay() {
  const { active } = useDndContext();

  if (active === null) {
    return null;
  }

  const activeUser = active.data.current?.user as User | undefined;
  const assignedHours = active.data.current?.assignedHours as
    | number
    | undefined;

  if (activeUser === undefined || assignedHours === undefined) {
    return null;
  }

  const roleIcons = {
    普通助理: <IconArrowBadgeDown size={20} />,
    资深助理: <IconBadge size={20} />,
    黑心: <IconMilitaryRank size={20} />,
  };

  return (
    <DragOverlay>
      <Badge className="flex items-center gap-1 text-md cursor-grab text-md">
        {roleIcons[activeUser.role]}
        <span>{activeUser.fullName}</span>
        <span>({assignedHours})</span>
      </Badge>
    </DragOverlay>
  );
}
