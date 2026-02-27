import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
interface UseMessageStore {
  message: string;
  setMessage: (v: string) => void;
}

export const useMessageStore = create<UseMessageStore>()(
  persist(
    (set) => ({
      message: "",
      setMessage: (v) => set({ message: v }),
    }),
    {
      name: "msg",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        message: state.message,
      }),
    },
  ),
);
