import { create } from "zustand";

interface State {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const useAddSchedulePlanDialogStore = create<State>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export default useAddSchedulePlanDialogStore;
