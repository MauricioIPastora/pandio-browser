import { useSidebar } from "@/components/ui/sidebar";

export function usePandioSidebar() {
  const { toggleSidebar } = useSidebar();
  return { toggleSidebar };
}
