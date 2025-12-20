import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "./ui/input";
import { SendIcon } from "lucide-react";
import { Button } from "./ui/button";

export function VinelyTabsSidebar() {
  return (
    <Sidebar collapsible="offcanvas" className="border-1 border-[#18181b]">
      <SidebarHeader className="bg-[#18181b]"></SidebarHeader>
      <SidebarContent className="bg-[#18181b]"></SidebarContent>
      <SidebarFooter className="flex bg-[#18181b]"></SidebarFooter>
    </Sidebar>
  );
}
