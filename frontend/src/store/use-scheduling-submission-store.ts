import { SchedulingResultShift } from "@/lib/types";
import { create } from "zustand";

interface State {
  schedulingSubmission: SchedulingResultShift[];
  setSchedulingSubmission: (
    schedulingSubmission: SchedulingResultShift[]
  ) => void;
}

const useSchedulingSubmissionStore = create<State>((set) => ({
  schedulingSubmission: [],
  setSchedulingSubmission: (schedulingSubmission) =>
    set({ schedulingSubmission }),
}));

export default useSchedulingSubmissionStore;
