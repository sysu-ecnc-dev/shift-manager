import { Badge } from "@/components/ui/badge";
import { AvailabilitySubmission, User } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";
import { IconBadge, IconMilitaryRank } from "@tabler/icons-react";
import { IconArrowBadgeDown } from "@tabler/icons-react";

interface Props {
  user: User;
  assignedHours: number;
  submission: AvailabilitySubmission;
}

export default function SchedulingAreaUserBadge({
  user,
  assignedHours,
  submission,
}: Props) {
  const { setNodeRef, transform, listeners, attributes } = useDraggable({
    id: user.id,
    data: { submission, user },
  });
  const roleIcons = {
    普通助理: <IconArrowBadgeDown size={20} />,
    资深助理: <IconBadge size={20} />,
    黑心: <IconMilitaryRank size={20} />,
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-grab"
      {...listeners}
      {...attributes}
    >
      <Badge className="flex items-center  gap-1 text-md">
        {roleIcons[user.role]}
        <span>{user.fullName}</span>
        <span>({assignedHours})</span>
      </Badge>
    </div>
  );
}
