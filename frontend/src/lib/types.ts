export type User = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: "普通助理" | "资深助理" | "黑心";
  isActive: boolean;
  createdAt: string;
};

export type ScheduleTemplateMeta = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
};

export type ScheduleTemplateShift = {
  id: number;
  startTime: string;
  endTime: string;
  requiredAssistantNumber: number;
  applicableDays: number[];
};

export type ScheduleTemplate = {
  meta: ScheduleTemplateMeta;
  shifts: ScheduleTemplateShift[];
};
