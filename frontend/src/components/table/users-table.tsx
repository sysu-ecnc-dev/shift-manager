import DataTable from "@/components/table/data-table";
import { User } from "@/lib/types";
import { usersTableColumns } from "@/components/table/users-table-columns";

interface Props {
  users: User[];
}

export default function UsersTable({ users }: Props) {
  return (
    <div className="my-2">
      <DataTable
        columns={usersTableColumns}
        data={users}
        globalSearchPlaceholder="搜索用户..."
      />
    </div>
  );
}
