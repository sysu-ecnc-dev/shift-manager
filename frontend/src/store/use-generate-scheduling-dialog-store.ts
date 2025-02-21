import { create } from "zustand";

interface State {
  open: boolean;
  setOpen: (open: boolean) => void;
  schedulePlanID: number;
  setSchedulePlanID: (schedulePlanID: number) => void;
}

const useGenerateSchedulingDialogStore = create<State>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  schedulePlanID: 0,
  setSchedulePlanID: (schedulePlanID) => set({ schedulePlanID }),
}));

export default useGenerateSchedulingDialogStore;
