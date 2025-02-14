import { User } from "@/lib/types";
import { create } from "zustand";

interface State {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User | null;
  setUser: (user: User) => void;
}

const useDeleteUserDialogStore = create<State>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  user: null,
  setUser: (user) => set({ user }),
}));

export default useDeleteUserDialogStore;
