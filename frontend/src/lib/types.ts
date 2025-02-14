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

export type AvailabilitySubmission = {
  id: number;
  schedulePlanName: string;
  username: string;
  items: [
    {
      shiftId: number;
      days: number[];
    }
  ];
};
