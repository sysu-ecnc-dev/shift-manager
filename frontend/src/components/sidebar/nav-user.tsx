import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut, UserIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyInfo, logout } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export default function NavUser() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: myInfo,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => getMyInfo().then((res) => res.data.data),
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate({ to: "/auth/login", replace: true });
      toast.success("登出成功");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isFetching) return null;

  if (isError) {
    toast.error(error.message);
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center justify-center rounded-md bg-primary text-primary-foreground h-8 w-8">
                <UserIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {myInfo?.fullName}({myInfo?.role})
                </span>
                <span className="truncate text-xs">{myInfo?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex items-center justify-center rounded-md bg-primary text-primary-foreground h-8 w-8">
                  <UserIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {myInfo?.fullName}({myInfo?.role})
                  </span>
                  <span className="truncate text-xs">{myInfo?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                <LogOut />
                登出
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
