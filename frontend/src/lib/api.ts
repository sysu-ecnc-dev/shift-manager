import axios from "axios";
import {
  AvailabilitySubmission,
  AvailabilitySubmissionItem,
  SchedulePlan,
  ScheduleTemplate,
  SchedulingParameters,
  SchedulingResult,
  SchedulingResultShift,
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
  data: { fullName?: string; email?: string; role?: string; isActive?: boolean }
) => api.patch<UnifiedResponse<User>>(`/users/${id}`, data);

export const updateUserPassword = (id: number, data: { password: string }) =>
  api.patch<UnifiedResponse<null>>(`/users/${id}/password`, data);

export const deleteUser = (id: number) =>
  api.delete<UnifiedResponse<null>>(`/users/${id}`);

export const getScheduleTemplates = () =>
  api.get<UnifiedResponse<ScheduleTemplate[]>>("/schedule-templates");

export const createScheduleTemplate = (data: {
  name: string;
  description: string;
  shifts: {
    startTime: string;
    endTime: string;
    requiredAssistantNumber: number;
    applicableDays: number[];
  }[];
}) => api.post<UnifiedResponse<ScheduleTemplate>>("/schedule-templates", data);

export const getScheduleTemplate = (id: number) =>
  api.get<UnifiedResponse<ScheduleTemplate>>(`/schedule-templates/${id}`);

export const updateScheduleTemplate = (
  id: number,
  data: { name: string; description: string }
) =>
  api.patch<UnifiedResponse<ScheduleTemplate>>(
    `/schedule-templates/${id}`,
    data
  );

export const deleteScheduleTemplate = (id: number) =>
  api.delete<UnifiedResponse<null>>(`/schedule-templates/${id}`);

// 与排班计划有关的 API
export const getSchedulePlans = () =>
  api.get<UnifiedResponse<SchedulePlan[]>>("/schedule-plans");

export const getSchedulePlan = (id: number) =>
  api.get<UnifiedResponse<SchedulePlan>>(`/schedule-plans/${id}`);

export const createSchedulePlan = (data: {
  name: string;
  description?: string;
  submissionStartTime: string;
  submissionEndTime: string;
  activeStartTime: string;
  activeEndTime: string;
  templateId: number;
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

export const getLatestAvailablePlan = () =>
  api.get<UnifiedResponse<SchedulePlan | null>>(
    "/schedule-plans/latest-available"
  );

// 与提交空闲时间有关的 API
export const submitYourAvailability = (data: {
  schedulePlanID: number;
  items: AvailabilitySubmissionItem[];
}) =>
  api.post<UnifiedResponse<AvailabilitySubmission>>(
    `/schedule-plans/${data.schedulePlanID}/your-submission`,
    data.items
  );

export const getYourSubmission = (schedulePlanID: number) =>
  api.get<UnifiedResponse<AvailabilitySubmission | null>>(
    `/schedule-plans/${schedulePlanID}/your-submission`
  );

export const getAllSubmissions = (schedulePlanID: number) =>
  api.get<UnifiedResponse<AvailabilitySubmission[]>>(
    `/schedule-plans/${schedulePlanID}/submissions`
  );

// 与排班有关的 API
export const getSchedulingResult = (schedulePlanID: number) =>
  api.get<UnifiedResponse<SchedulingResult | null>>(
    `/schedule-plans/${schedulePlanID}/scheduling-result`
  );

export const submitSchedulingResult = (
  schedulePlanID: number,
  shifts: SchedulingResultShift[]
) =>
  api.post<UnifiedResponse<SchedulingResult>>(
    `/schedule-plans/${schedulePlanID}/scheduling-result`,
    shifts
  );

export const generateSchedulingResult = (
  schedulePlanID: number,
  data: SchedulingParameters
) =>
  api.post<UnifiedResponse<SchedulingResultShift[]>>(
    `/schedule-plans/${schedulePlanID}/scheduling-result/generate`,
    data,
    {
      timeout: 100000,
    }
  );
