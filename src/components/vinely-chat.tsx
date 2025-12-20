import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon, XIcon } from "lucide-react";
import { Rnd } from "react-rnd";

export function VinelyChat({ onClose }: { onClose: () => void }) {
  return (
    <Rnd
      default={{
        x: window.innerWidth - 380, // Position near right edge
        y: window.innerHeight - 1000, // Position near bottom
        width: 350,
        height: 500,
      }}
      minWidth={300}
      minHeight={300}
      maxWidth={800}
      maxHeight={window.innerHeight - 100}
      dragHandleClassName="drag-handle"
      bounds="window" // ADD: Prevent dragging outside parent container
      style={{
        zIndex: 9999,
      }}
    >
      <Card className="h-full flex flex-col bg-[#18181b] border-white/10">
        {" "}
        {/* ADD: h-full flex flex-col for proper sizing */}
        <CardHeader className="drag-handle cursor-move py-2 px-4 flex flex-row items-center justify-between space-y-0">
          {" "}
          {/* ADD: drag-handle class and cursor */}
          <CardTitle className="text-[#fafafa] text-lg font-bold text-center">
            Vinely Chat
          </CardTitle>
          <Button
            onClick={onClose}
            size="icon"
            className=" bg-[#ff6568] hover:bg-[#ff2357]/80 h-6 w-6"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <div className="flex justify-end border-b border-white/10"></div>
        <CardContent className="flex-1 overflow-auto"></CardContent>{" "}
        {/* ADD: flex-1 overflow-auto */}
        <CardFooter>
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Ask Vinely a question"
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
