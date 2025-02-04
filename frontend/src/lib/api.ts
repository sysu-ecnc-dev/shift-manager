import axios from "axios";
import { User } from "@/lib/types";

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
