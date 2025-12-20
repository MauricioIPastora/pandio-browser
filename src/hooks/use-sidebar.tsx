import { useSidebar } from "@/components/ui/sidebar";

export function useVinelySidebar() {
  const { toggleSidebar } = useSidebar();
  return { toggleSidebar };
}
