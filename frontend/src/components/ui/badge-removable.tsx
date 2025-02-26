import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"
import { badgeVariants } from "./badge";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
      onRemove: () => void;
    }

function BadgeRemovable({ className, variant, onRemove, ...props }: BadgeProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
      </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem
            className="text-destructive text-center bg-red-50"
            onClick={onRemove}
          >
          <span className="w-full">删除</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { BadgeRemovable }
