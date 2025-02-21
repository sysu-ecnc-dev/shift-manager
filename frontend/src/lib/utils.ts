import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ScheduleTemplate, SchedulingResultShift } from "@/lib/types";
import { differenceInSeconds, parse } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateAssignedHours = (
  userID: number,
  schedulingSubmission: SchedulingResultShift[],
  scheduleTemplate: ScheduleTemplate
) => {
  let result = 0;

  for (const resultShift of schedulingSubmission) {
    if (
      !resultShift.items.some(
        (item) =>
          item.principalID === userID || item.assistantIDs.includes(userID)
      )
    ) {
      continue;
    }

    const shiftTemplate = scheduleTemplate.shifts.find(
      (shift) => shift.id === resultShift.shiftID
    );
    if (!shiftTemplate) {
      continue;
    }

    const startTime = parse(shiftTemplate.startTime, "HH:mm:ss", new Date());
    const endTime = parse(shiftTemplate.endTime, "HH:mm:ss", new Date());

    const assignedHours = differenceInSeconds(endTime, startTime) / 3600;

    result +=
      assignedHours *
      resultShift.items.filter(
        (item) =>
          item.principalID === userID || item.assistantIDs.includes(userID)
      ).length;
  }

  return Number(result.toFixed(1));
};
