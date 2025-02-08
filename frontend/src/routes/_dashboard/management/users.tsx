import UsersTable from "@/components/table/users-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/management/users")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-4 flex flex-col gap-2 mt-8">
      <h1 className="text-2xl font-bold">用户管理</h1>
      <span className="text-sm text-muted-foreground">
        在这里你可以新建用户或编辑已有用户信息
      </span>
      <UsersTable />
    </div>
  );
}
