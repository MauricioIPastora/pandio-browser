import { TabsSlice } from "@/types/tab-slice";
import { merge } from "lodash";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createTabSlice } from "./tab-slice";

type Store = TabsSlice;

export const useBoundStore = create(
  persist<Store>(
    (...a) => ({
      ...createTabSlice(...a),
    }),
    {
      name: "pandio-tabs-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        return merge({}, currentState, persistedState);
      },
      partialize: (state) =>
        ({
          tabs: {
            items: state.tabs.items,
            selectedTabId: state.tabs.selectedTabId,
          },
        }) as Pick<Store, "tabs">,
    }
  )
);
