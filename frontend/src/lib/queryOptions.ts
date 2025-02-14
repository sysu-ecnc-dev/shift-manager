import { queryOptions } from "@tanstack/react-query";
import { getUsers } from "@/lib/api";

export const getUsersQueryOptions = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: () => getUsers().then((res) => res.data.data),
  });
