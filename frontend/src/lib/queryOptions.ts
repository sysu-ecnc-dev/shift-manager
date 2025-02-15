import { queryOptions } from "@tanstack/react-query";
import {
  getLatestAvailablePlan,
  getSchedulePlans,
  getScheduleTemplate,
  getScheduleTemplates,
  getUsers,
  getYourSubmission,
} from "@/lib/api";

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

export const getScheduleTemplateQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["schedule-template", id],
    queryFn: () => getScheduleTemplate(id).then((res) => res.data.data),
  });

export const getSchedulePlansQueryOptions = () =>
  queryOptions({
    queryKey: ["schedule-plans"],
    queryFn: () => getSchedulePlans().then((res) => res.data.data),
  });

export const getLatestAvailablePlanQueryOptions = () =>
  queryOptions({
    queryKey: ["latest-available-plan"],
    queryFn: () => getLatestAvailablePlan().then((res) => res.data.data),
  });

export const getYourSubmissionQueryOptions = (schedulePlanID: number) =>
  queryOptions({
    queryKey: ["schedule-plan", schedulePlanID, "your-submission"],
    queryFn: () =>
      getYourSubmission(schedulePlanID).then((res) => res.data.data),
  });
