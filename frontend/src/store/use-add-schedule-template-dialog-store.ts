import { create } from "zustand";

interface State {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const useAddScheduleTemplateDialogStore = create<State>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export default useAddScheduleTemplateDialogStore;
