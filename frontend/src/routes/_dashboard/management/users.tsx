import AddUserDialog from "@/components/dialog/add-user-dialog";
import EditUserDialog from "@/components/dialog/edit-user-dialog";
import UsersTable from "@/components/table/users-table";
import { Button } from "@/components/ui/button";
import { getUsersQueryOptions } from "@/lib/queryOptions";
import useAddUserDialogStore from "@/store/use-add-user-dialog-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/management/users")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(getUsersQueryOptions()),
  component: RouteComponent,
});

function RouteComponent() {
  const { setOpen } = useAddUserDialogStore();
  const { data: users } = useSuspenseQuery(getUsersQueryOptions());

  return (
    <>
      <div className="px-4 flex flex-col gap-2 mt-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">用户管理</h1>
            <span className="text-sm text-muted-foreground">
              在这里你可以新建用户或编辑已有用户信息
            </span>
          </div>
          <Button onClick={() => setOpen(true)}>添加用户</Button>
        </div>
        <UsersTable users={users} />
      </div>
      <AddUserDialog />
      <EditUserDialog />
    </>
  );
}
