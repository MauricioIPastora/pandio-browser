/// <reference types="vite/client" />
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
import { useState, useEffect, useRef } from "react";

export function PandioChat({ onClose }: { onClose: () => void }) {
  const [isSidebarMode, setIsSidebarMode] = useState(true);
  const sidebarWidth = 300;

  // Chat state management
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate sidebar position
  const getSidebarX = () => window.innerWidth - sidebarWidth;
  const [sidebarX, setSidebarX] = useState(getSidebarX());

  // Update sidebar position on resize (only needed for modal mode)
  useEffect(() => {
    if (!isSidebarMode) {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get API key from environment (Vite exposes it via import.meta.env)
  const getApiKey = () => {
    return import.meta.env.VITE_OPENAI_API_KEY || "";
  };

  // Call OpenAI API using fetch (works in Electron renderer)
  const callOpenAI = async (
    messages: Array<{ role: "user" | "assistant"; content: string }>
  ) => {
    const apiKey = getApiKey();

    if (!apiKey) {
      throw new Error(
        "OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file."
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return (
      data.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response."
    );
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    const newMessages = [
      ...messages,
      { role: "user" as const, content: userMessage },
    ];
    setMessages(newMessages);

    // Scroll after user message
    setTimeout(() => scrollToBottom(), 0);

    setIsLoading(true);

    try {
      const assistantMessage = await callOpenAI(newMessages);
      const updatedMessages = [
        ...newMessages,
        { role: "assistant" as const, content: assistantMessage },
      ];
      setMessages(updatedMessages);

      // Scroll after assistant message
      setTimeout(() => scrollToBottom(), 0);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      const errorMessages = [
        ...newMessages,
        {
          role: "assistant" as const,
          content:
            error instanceof Error
              ? error.message
              : "Sorry, I encountered an error. Please try again.",
        },
      ];
      setMessages(errorMessages);

      // Scroll after error message
      setTimeout(() => scrollToBottom(), 0);
    } finally {
      setIsLoading(false);
    }
  };

  // Sidebar mode - inset right sidebar (part of layout flow)
  if (isSidebarMode) {
    return (
      <div
        className="flex-shrink-0 h-full bg-[#18181b]"
        style={{
          width: `${sidebarWidth}px`,
        }}
      >
        <Card className="h-full flex flex-col bg-[#18181b] border-white/10 rounded-none">
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
          <CardContent className="flex-1 overflow-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-[#71717a] mt-8">
                Start a conversation with Pandio
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-[#27272a] text-[#fafafa]"
                        : "bg-[#3f3f46] text-[#fafafa]"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#3f3f46] text-[#fafafa] rounded-lg px-4 py-2">
                  <div className="text-sm">Thinking...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter>
            <div className="relative flex-1">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Pandio a question"
                disabled={isLoading}
                className="pr-10 w-full bg-[#27272a] text-[#71717a] placeholder:text-[#71717a] border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#18181b] hover:bg-[#27272a] text-[#71717a] hover:text-[#a1a1aa] disabled:opacity-50 disabled:cursor-not-allowed"
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
        <CardContent className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-[#71717a] mt-8">
              Start a conversation with Pandio
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-[#27272a] text-[#fafafa]"
                      : "bg-[#3f3f46] text-[#fafafa]"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#3f3f46] text-[#fafafa] rounded-lg px-4 py-2">
                <div className="text-sm">Thinking...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter>
          <div className="relative flex-1">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Pandio a question"
              disabled={isLoading}
              className="pr-10 w-full bg-[#27272a] text-[#71717a] placeholder:text-[#71717a] border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#18181b] hover:bg-[#27272a] text-[#71717a] hover:text-[#a1a1aa] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Rnd>
  );
}
