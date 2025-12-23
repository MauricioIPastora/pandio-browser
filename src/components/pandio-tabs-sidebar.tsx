import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PandioTabsSidebar() {
  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="border-1 border-[#18181b]"
    >
      <SidebarHeader className="bg-[#18181b]"></SidebarHeader>
      <SidebarContent className="bg-[#18181b]">
        <Tabs defaultValue="tab1" orientation="vertical">
          <TabsList className="bg-transparent text-white">
            <TabsTrigger
              value="tab1"
              className="data-[state=active]:bg-[#18181b] data-[state=active]:text-white text-white/70 hover:text-white"
            >
              Tab 1
            </TabsTrigger>
            <TabsTrigger
              value="tab2"
              className="data-[state=active]:bg-[#18181b] data-[state=active]:text-white text-white/70 hover:text-white"
            >
              Tab 2
            </TabsTrigger>
            <TabsTrigger
              value="tab3"
              className="data-[state=active]:bg-[#18181b] data-[state=active]:text-white text-white/70 hover:text-white"
            >
              Tab 3
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </SidebarContent>
      <SidebarFooter className="flex bg-[#18181b]"></SidebarFooter>
    </Sidebar>
  );
}
