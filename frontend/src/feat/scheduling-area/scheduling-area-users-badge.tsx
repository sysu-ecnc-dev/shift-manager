import { Badge } from "@/components/ui/badge";
import { AvailabilitySubmission, User } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";

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
    data: { submission },
  });

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
      <Badge className="flex items-center justify-center gap-1 text-md">
        <span>{user.fullName}</span>
        <span>({assignedHours})</span>
      </Badge>
    </div>
  );
}
