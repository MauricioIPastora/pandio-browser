import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon, XIcon, Maximize2Icon, Minimize2Icon } from "lucide-react";
import { Rnd } from "react-rnd";
import { useState, useEffect } from "react";

export function PandioChat({ onClose }: { onClose: () => void }) {
  const [isSidebarMode, setIsSidebarMode] = useState(true);
  const sidebarWidth = 300;

  // Calculate sidebar position
  const getSidebarX = () => window.innerWidth - sidebarWidth;
  const [sidebarX, setSidebarX] = useState(getSidebarX());

  // Update sidebar position on window resize
  useEffect(() => {
    if (isSidebarMode) {
      const handleResize = () => {
        setSidebarX(getSidebarX());
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isSidebarMode]);

  const handleRelease = () => {
    setIsSidebarMode(false);
  };

  const handleMinimize = () => {
    setIsSidebarMode(true);
    setSidebarX(window.innerWidth - sidebarWidth);
  };

  // Sidebar mode - fixed right sidebar
  if (isSidebarMode) {
    return (
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: `${sidebarWidth}px`,
          zIndex: 9999,
        }}
      >
        <Card className="h-full flex flex-col bg-[#18181b] border-white/10">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[#fafafa] text-lg font-bold text-center">
              Pandio Chat
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleRelease}
                size="icon"
                className="bg-[#27272a] hover:bg-[#3f3f46] h-6 w-6"
                title="Release to moveable modal"
              >
                <Maximize2Icon className="h-4 w-4" />
              </Button>
              <Button
                onClick={onClose}
                size="icon"
                className="bg-[#ff6568] hover:bg-[#ff2357]/80 h-6 w-6"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <div className="flex justify-end border-b border-white/10"></div>
          <CardContent className="flex-1 overflow-auto"></CardContent>
          <CardFooter>
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Ask Pandio a question"
                className="pr-10 w-full bg-[#27272a] text-[#71717a] placeholder:text-[#71717a] border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#18181b] hover:bg-[#27272a] text-[#71717a] hover:text-[#a1a1aa]"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Modal mode - draggable and resizable
  return (
    <Rnd
      default={{
        x: window.innerWidth - 380,
        y: window.innerHeight - 1000,
        width: 350,
        height: 500,
      }}
      minWidth={300}
      minHeight={300}
      maxWidth={800}
      maxHeight={window.innerHeight - 100}
      dragHandleClassName="drag-handle"
      bounds="window"
      style={{
        zIndex: 9999,
      }}
    >
      <Card className="h-full flex flex-col bg-[#18181b] border-white/10">
        <CardHeader className="drag-handle cursor-move py-2 px-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[#fafafa] text-lg font-bold text-center">
            Pandio Chat
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="icon"
              className="bg-[#27272a] hover:bg-[#3f3f46] h-6 w-6"
              onClick={handleMinimize}
            >
              <Minimize2Icon className="h-4 w-4" />
            </Button>
            <Button
              onClick={onClose}
              size="icon"
              className="bg-[#ff6568] hover:bg-[#ff2357]/80 h-6 w-6"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <div className="flex justify-end border-b border-white/10"></div>
        <CardContent className="flex-1 overflow-auto"></CardContent>
        <CardFooter>
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Ask Pandio a question"
              className="pr-10 w-full bg-[#27272a] text-[#71717a] placeholder:text-[#71717a] border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#18181b] hover:bg-[#27272a] text-[#71717a] hover:text-[#a1a1aa]"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Rnd>
  );
}
