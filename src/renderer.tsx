import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileIcon,
  HomeIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import { useVinelySidebar } from "@/hooks/use-sidebar";
import { VinelyTabsSidebar } from "./components/vinely-tabs-sidebar";
import useChat from "./hooks/use-chat";
import { VinelyChat } from "./components/vinely-chat";

function App() {
  const [url, setUrl] = useState("https://vinely.ai");
  const webViewRef = useRef<any>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const { toggleSidebar } = useVinelySidebar(); // open is true if the sidebar is open, false if it is closed
  const { isChatOpen, toggleChat, closeChat } = useChat();

  useEffect(() => {
    const webview = webViewRef.current;
    if (!webview) return;

    // set the initial url only on mount

    if (!webview.src) {
      webview.src = url;
      if (urlInputRef.current) {
        urlInputRef.current.value = url;
      }
    }

    // handle navigation events
    const handleNavigation = (event: any) => {
      setUrl(event.url);
      if (urlInputRef.current) {
        urlInputRef.current.value = event.url;
      }
    };

    webview.addEventListener("did-navigate", handleNavigation);

    return () => {
      webview.removeEventListener("did-navigate", handleNavigation);
    };
  }, []);

  const handleUrl = () => {
    const webview = webViewRef.current;
    const inputURL = urlInputRef.current?.value || "";

    if (!webview || !inputURL) return;

    let finalUrl = "";
    if (inputURL.startsWith("http://") || inputURL.startsWith("https://")) {
      finalUrl = inputURL;
    } else if (/\.([a-z]{2,}|[a-z]{2,}\.[a-z]{2,})/i.test(inputURL)) {
      finalUrl = "https://" + inputURL;
    } else {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(inputURL)}`;
    }

    webview.src = finalUrl;
    setUrl(finalUrl);
    if (urlInputRef.current) {
      urlInputRef.current.value = finalUrl;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleUrl();
    }
  };

  const handleBack = () => {
    webViewRef.current?.goBack();
  };

  const handleForward = () => {
    webViewRef.current?.goForward();
  };

  const handleRefresh = () => {
    webViewRef.current?.reload();
  };

  const handleSearch = () => {
    const searchUrl = "https://www.google.com/";
    setUrl(searchUrl);
    if (urlInputRef.current) {
      urlInputRef.current.value = searchUrl;
    }
    if (webViewRef.current) {
      webViewRef.current.src = searchUrl;
    }
  };

  const handleHome = () => {
    const homeUrl = "https://vinely.ai";
    setUrl(homeUrl);
  };

  const handleChat = () => {
    if (!isChatOpen) {
      toggleChat();
    } else {
      toggleChat();
    }
  };

  return (
    <div
      id="browser-container"
      className="flex flex-col w-full h-full bg-gray-800"
    >
      <div
        id="browser-tools"
        className="flex w-full space-x-1 p-3 bg-[#18181b] border-b border-white/10"
      >
        <VinelyTabsSidebar />
        <div id="button-container" className="flex space-x-1">
          <Button
            onClick={toggleSidebar}
            className="text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-[#18181b]"
          >
            <FileIcon />
          </Button>
          <Button
            onClick={handleBack}
            className="text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-[#18181b]"
          >
            <ArrowLeftIcon />
          </Button>
          <Button
            onClick={handleForward}
            className="text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-[#18181b]"
          >
            <ArrowRightIcon />
          </Button>
          <Button
            onClick={handleRefresh}
            className="text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-[#18181b]"
          >
            <RefreshCwIcon />
          </Button>
          <Button
            onClick={handleSearch}
            className="text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-[#18181b]"
          >
            <SearchIcon />
          </Button>
          <Button
            onClick={handleHome}
            className="text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-[#18181b]"
          >
            <HomeIcon />
          </Button>
        </div>
        <div id="url-input-container" className="flex w-full gap-1">
          <Input
            type="text"
            ref={urlInputRef}
            onKeyDown={handleKeyDown}
            className="bg-[#27272a] text-[#71717a] border-white/10 hover:bg-[#e4e4e7]/10 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={handleChat}
            className="text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-[#18181b]"
          >
            <MessageCircleIcon />
          </Button>
        </div>
      </div>
      <div id="webview-container" className="flex w-full h-full bg-slate-500">
        <webview ref={webViewRef} src={url} className="w-full h-full" />
      </div>
      {isChatOpen && <VinelyChat onClose={closeChat} />}
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <SidebarProvider className="h-full">
        <App />
      </SidebarProvider>
    </React.StrictMode>
  );
}
