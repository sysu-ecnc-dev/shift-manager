export type User = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: "普通助理" | "资深助理" | "黑心";
  isActive: boolean;
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
  id: number;
  name: string;
  description: string;
  createdAt: string;
  shifts: ScheduleTemplateShift[];
};

export type SchedulePlan = {
  id: number;
  name: string;
  description: string;
  submissionStartTime: string;
  submissionEndTime: string;
  activeStartTime: string;
  activeEndTime: string;
  scheduleTemplateID: number;
  createdAt: string;
};

export type AvailabilitySubmissionItem = {
  shiftID: number;
  days: number[];
};

export type AvailabilitySubmission = {
  id: number;
  schedulePlanID: number;
  userID: number;
  items: AvailabilitySubmissionItem[];
  createdAt: string;
};

export type SchedulingResultShiftItem = {
  day: number;
  principalID: number | null; // null 表示班次在当天没有负责人
  assistantIDs: number[];
};

export type SchedulingResultShift = {
  shiftID: number;
  items: SchedulingResultShiftItem[];
};

export type SchedulingResult = {
  id: number;
  schedulePlanID: number;
  shifts: SchedulingResultShift[];
  createdAt: string;
};

export type SchedulingParameters = {
  populationSize: number;
  maxGenerations: number;
  crossoverRate: number;
  mutationRate: number;
  EliteCount: number;
  FairnessWeight: number;
};
