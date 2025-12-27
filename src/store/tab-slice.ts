import { TabsSlice } from "@/types/tab-slice";
import { TabInfo } from "@/types/tabs";
import { produce } from "immer";
import { StateCreator } from "zustand";

export const createTabSlice: StateCreator<TabsSlice, [], [], TabsSlice> = (
  set
) => ({
  tabs: {
    items: [{ id: 0, name: "New Tab", url: "https://vinely.ai" }],
    selectedTabId: 0,
    selectedTabIndex: 0,

    setSelectedTab: (tab: TabInfo) => {
      set(
        produce((state: TabsSlice) => {
          state.tabs.selectedTabId = tab.id;
          state.tabs.selectedTabIndex = state.tabs.items.findIndex(
            (item) => tab.id === item.id
          );
        })
      );
    },

    remove: (tab: TabInfo) =>
      set(
        produce((state: TabsSlice) => {
          if (state.tabs.items.length === 1) {
            state.tabs.items[0] = {
              id: Date.now(),
              name: "New Tab",
              url: "https://vinely.ai",
            };
            state.tabs.selectedTabId = state.tabs.items[0].id;
            state.tabs.selectedTabIndex = 0;
            return;
          }

          const index = state.tabs.items.findIndex((t) => t.id === tab.id);
          if (tab.id === state.tabs.selectedTabId) {
            if (index === state.tabs.items.length - 1) {
              state.tabs.selectedTabId = state.tabs.items[index - 1].id;
            } else {
              state.tabs.selectedTabId = state.tabs.items[index + 1].id;
            }
          }

          state.tabs.items.splice(index, 1);
          state.tabs.selectedTabIndex = state.tabs.items.findIndex(
            (t) => t.id === state.tabs.selectedTabId
          );
        })
      ),

    add: () => {
      const newId = Date.now();
      set(
        produce((state: TabsSlice) => {
          state.tabs.items.push({
            id: newId,
            name: "New Tab",
            url: "https://vinely.ai",
          });
          state.tabs.selectedTabId = newId;
          state.tabs.selectedTabIndex = state.tabs.items.length - 1;
        })
      );
    },

    updateTab: (id: number, updates: Partial<TabInfo>) => {
      set(
        produce((state: TabsSlice) => {
          const tab = state.tabs.items.find((t) => t.id === id);
          if (tab) {
            Object.assign(tab, updates);
          }
        })
      );
    },
  },
});
