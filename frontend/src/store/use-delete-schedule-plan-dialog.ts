import { SchedulePlan } from "@/lib/types";
import { create } from "zustand";

interface State {
  open: boolean;
  setOpen: (open: boolean) => void;
  schedulePlan: SchedulePlan | null;
  setSchedulePlan: (schedulePlan: SchedulePlan) => void;
}

const useDeleteSchedulePlanDialogStore = create<State>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  schedulePlan: null,
  setSchedulePlan: (schedulePlan) => set({ schedulePlan }),
}));

export default useDeleteSchedulePlanDialogStore;
