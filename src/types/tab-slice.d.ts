import { TabInfo } from "./tabs";

export interface TabsSlice {
  tabs: {
    items: TabInfo[];
    selectedTabId: number;
    selectedTabIndex: number;
    setSelectedTab: (tab: TabInfo) => void;
    remove: (tab: TabInfo) => void;
    add: () => void;
    updateTab: (id: number, updates: Partial<TabInfo>) => void;
  };
}
