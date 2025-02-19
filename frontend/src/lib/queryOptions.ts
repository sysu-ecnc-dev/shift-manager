import { queryOptions } from "@tanstack/react-query";
import {
  getAllSubmissions,
  getLatestAvailablePlan,
  getSchedulePlan,
  getSchedulePlans,
  getScheduleTemplate,
  getScheduleTemplates,
  getSchedulingResult,
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

export const getSchedulePlanQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["schedule-plan", id],
    queryFn: () => getSchedulePlan(id).then((res) => res.data.data),
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

export const getAllSubmissionsQueryOptions = (schedulePlanID: number) =>
  queryOptions({
    queryKey: ["schedule-plan", schedulePlanID, "submissions"],
    queryFn: () =>
      getAllSubmissions(schedulePlanID).then((res) => res.data.data),
  });

export const getSchedulingResultQueryOptions = (schedulePlanID: number) =>
  queryOptions({
    queryKey: ["schedule-plan", schedulePlanID, "scheduling-result"],
    queryFn: () =>
      getSchedulingResult(schedulePlanID).then((res) => res.data.data),
  });
