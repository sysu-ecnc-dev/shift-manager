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
  return schedulingSubmission
    .filter((submissionShift) =>
      submissionShift.items.some(
        (item) =>
          item.principalID === userID || item.assistantIDs.includes(userID)
      )
    )
    .reduce((acc, shift) => {
      const shiftTemplate = scheduleTemplate.shifts.find(
        (shiftTemplate) => shiftTemplate.id === shift.shiftID
      );

      if (shiftTemplate !== undefined) {
        return Number(
          (
            acc +
            differenceInSeconds(
              parse(shiftTemplate.endTime, "HH:mm:ss", new Date()),
              parse(shiftTemplate.startTime, "HH:mm:ss", new Date())
            ) /
              3600
          ).toFixed(2)
        );
      }

      return acc;
    }, 0);
};
