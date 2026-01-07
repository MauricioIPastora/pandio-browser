import { TabsSlice } from "@/types/tab-slice";
import { FilesSlice, createFileSlice } from "./file-slice";
import { merge } from "lodash";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createTabSlice } from "./tab-slice";

type Store = TabsSlice & FilesSlice;

export const useBoundStore = create(
  persist<Store>(
    (...a) => ({
      ...createTabSlice(...a),
      ...createFileSlice(...a),
    }),
    {
      name: "pandio-tabs-storage",
      version: 2, // Increment version!
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
          files: {
            items: state.files.items,
          },
        }) as Pick<Store, "tabs" | "files">,
    }
  )
);
