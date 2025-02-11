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

export type SchedulePlan = {
  id: number;
  name: string;
  submissionStartTime: string;
  submissionEndTime: string;
  activeStartTime: string;
  activeEndTime: string;
  scheduleTemplateName: string;
  status: "未开始" | "开放提交" | "排班中" | "生效中" | "已结束";
  createdAt: string;
};
