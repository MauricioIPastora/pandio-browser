import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useBoundStore } from "@/store/useBoundStore";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";

export function PandioTabsSidebar() {
  const tabs = useBoundStore((state) => state.tabs.items);
  const selectedTabId = useBoundStore((state) => state.tabs.selectedTabId);
  const setSelectedTab = useBoundStore((state) => state.tabs.setSelectedTab);
  const removeTab = useBoundStore((state) => state.tabs.remove);
  const addTab = useBoundStore((state) => state.tabs.add);

  // TODO:add favicon to the tab info
  // TODO:add tab url to the tab in the sidebar
  // TODO:add reording of tabs
  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="border-1 border-[#18181b]"
    >
      <SidebarHeader className="bg-[#18181b] p-2">
        <Button
          onClick={() => addTab()}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-[#27272a]"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          New Tab
        </Button>
      </SidebarHeader>
      <SidebarContent className="bg-[#18181b] p-2">
        <div className="flex flex-col gap-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setSelectedTab(tab)}
              className={`
      group flex items-center justify-between px-3 py-2 rounded cursor-pointer
      ${
        selectedTabId === tab.id
          ? "bg-[#27272a] text-white"
          : "text-white/70 hover:text-white hover:bg-[#27272a]/50"
      }
    `}
            >
              {/* 👇 Add favicon here */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {tab.favicon ? (
                  <img
                    src={tab.favicon}
                    alt=""
                    className="w-4 h-4 flex-shrink-0"
                    onError={(e) => {
                      // Fallback if favicon fails to load
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-4 h-4 flex-shrink-0 bg-white/20 rounded" />
                )}
                <span className="text-sm truncate">{tab.name || tab.url}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter className="flex bg-[#18181b]"></SidebarFooter>
    </Sidebar>
  );
}
