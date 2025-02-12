import axios from "axios";
import {
  SchedulePlan,
  ScheduleTemplate,
  ScheduleTemplateMeta,
  User,
} from "@/lib/types";

export const api = axios.create({
  baseURL: "/api",
  timeout: 5000,
  withCredentials: true,
});

export type UnifiedResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

api.interceptors.response.use((response) => {
  const data = response.data as UnifiedResponse<unknown>;
  if (!data.success) {
    return Promise.reject(new Error(data.message));
  }
  return response;
});

export const login = (data: { username: string; password: string }) =>
  api.post<UnifiedResponse<User>>("/auth/login", data);

export const logout = () => api.post<UnifiedResponse<null>>("/auth/logout");

export const getMyInfo = () => api.get<UnifiedResponse<User>>("/my-info");

export const requireChangeEmail = (data: { newEmail: string }) =>
  api.post<UnifiedResponse<null>>("/my-info/change-email/require", data);

export const confirmChangeEmail = (data: { newEmail: string; otp: string }) =>
  api.post<UnifiedResponse<null>>("/my-info/change-email/confirm", data);

export const updatePassword = (data: {
  oldPassword: string;
  newPassword: string;
}) => api.patch<UnifiedResponse<null>>("/my-info/password", data);

export const requireResetPassword = (data: { username: string }) =>
  api.post<UnifiedResponse<null>>("/auth/reset-password/require", data);

export const confirmResetPassword = (data: {
  username: string;
  otp: string;
  password: string;
}) => api.post<UnifiedResponse<null>>("/auth/reset-password/confirm", data);

export const getUsers = () => api.get<UnifiedResponse<User[]>>("/users");

export const createUser = (data: {
  username: string;
  fullName: string;
  email: string;
  role: string;
}) => api.post<UnifiedResponse<User>>("/users", data);

export const updateUser = (
  id: number,
  data: { role?: string; isActive?: boolean }
) => api.patch<UnifiedResponse<User>>(`/users/${id}`, data);

export const deleteUser = (id: number) =>
  api.delete<UnifiedResponse<null>>(`/users/${id}`);

export const getAllScheduleTemplateMeta = () =>
  api.get<UnifiedResponse<ScheduleTemplateMeta[]>>("/schedule-template-meta");

export const createScheduleTemplate = (data: {
  meta: {
    name: string;
    description: string;
  };
  shifts: {
    startTime: string;
    endTime: string;
    requiredAssistantNumber: number;
    applicableDays: number[];
  }[];
}) => api.post<UnifiedResponse<ScheduleTemplate>>("/schedule-templates", data);

export const getScheduleTemplate = (id: number) =>
  api.get<UnifiedResponse<ScheduleTemplate>>(`/schedule-templates/${id}`);

export const updateScheduleTemplateMeta = (
  id: number,
  data: { name: string; description: string }
) =>
  api.patch<UnifiedResponse<ScheduleTemplateMeta>>(
    `/schedule-template-meta/${id}`,
    data
  );

export const deleteScheduleTemplate = (id: number) =>
  api.delete<UnifiedResponse<null>>(`/schedule-template-meta/${id}`);

export const getSchedulePlans = () =>
  api.get<UnifiedResponse<SchedulePlan[]>>("/schedule-plans");

export const createSchedulePlan = (data: {
  name: string;
  description: string;
  submissionStartTime: string;
  submissionEndTime: string;
  activeStartTime: string;
  activeEndTime: string;
  templateName: string;
}) => api.post<UnifiedResponse<SchedulePlan>>("/schedule-plans", data);

export const updateSchedulePlan = (
  id: number,
  data: {
    name?: string;
    description?: string;
    submissionStartTime?: string;
    submissionEndTime?: string;
    activeStartTime?: string;
    activeEndTime?: string;
  }
) => api.patch<UnifiedResponse<SchedulePlan>>(`/schedule-plans/${id}`, data);

export const deleteSchedulePlan = (id: number) =>
  api.delete<UnifiedResponse<null>>(`/schedule-plans/${id}`);

export const getLatestSubmissionAvailablePlan = () =>
  api.get<
    UnifiedResponse<{
      plan: SchedulePlan;
      template: ScheduleTemplate;
    }>
  >("/latest-available-schedule-plan");
