import { queryOptions } from "@tanstack/react-query";
import { getSchedulePlans, getScheduleTemplates, getUsers } from "@/lib/api";

export const getUsersQueryOptions = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: () => getUsers().then((res) => res.data.data),
  });

export const getScheduleTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ["schedule-templates"],
    queryFn: () => getScheduleTemplates().then((res) => res.data.data),
  });

export const getSchedulePlansQueryOptions = () =>
  queryOptions({
    queryKey: ["schedule-plans"],
    queryFn: () => getSchedulePlans().then((res) => res.data.data),
  });
