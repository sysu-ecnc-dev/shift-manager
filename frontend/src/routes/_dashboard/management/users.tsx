import AddUserDialog from "@/components/dialog/add-user-dialog";
import UsersTable from "@/components/table/users-table";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/management/users")({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = useState(false);

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
        <UsersTable />
      </div>
      <AddUserDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
