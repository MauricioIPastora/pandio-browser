import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileIcon,
  HomeIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import { usePandioSidebar } from "@/hooks/use-sidebar";
import { PandioTabsSidebar } from "./components/pandio-tabs-sidebar";
import useChat from "./hooks/use-chat";
import { PandioChat } from "./components/pandio-chat";
import { useBoundStore } from "@/store/useBoundStore";

function App() {
  const tabs = useBoundStore((state) => state.tabs.items);
  const selectedTabId = useBoundStore((state) => state.tabs.selectedTabId);
  const updateTab = useBoundStore((state) => state.tabs.updateTab);

  const webviewRefs = useRef<Map<number, HTMLWebViewElement>>(new Map());
  const urlInputRef = useRef<HTMLInputElement>(null);

  const currentTab = tabs.find((t) => t.id === selectedTabId);
  const { toggleSidebar } = usePandioSidebar(); // open is true if the sidebar is open, false if it is closed
  const { isChatOpen, toggleChat, closeChat } = useChat();

  // Setup webview event listeners for each tab
  useEffect(() => {
    if (currentTab && urlInputRef.current) {
      urlInputRef.current.value = currentTab.url;
    }
    tabs.forEach((tab) => {
      const webview = webviewRefs.current.get(tab.id);
      if (!webview) return;

      const handleNavigation = (event: any) => {
        updateTab(tab.id, { url: event.url });
        if (tab.id === selectedTabId && urlInputRef.current) {
          urlInputRef.current.value = event.url;
        }
      };

      const handleTitleUpdate = (event: any) => {
        updateTab(tab.id, { name: event.title });
      };

      const handleFaviconUpdate = (event: any) => {
        // event.favicons is an array of favicon URLs
        if (event.favicons && event.favicons.length > 0) {
          updateTab(tab.id, { favicon: event.favicons[0] });
        }
      };

      webview.addEventListener("did-navigate", handleNavigation);
      webview.addEventListener("page-title-updated", handleTitleUpdate);
      webview.addEventListener("page-favicon-updated", handleFaviconUpdate);

      return () => {
        webview.removeEventListener("did-navigate", handleNavigation);
        webview.removeEventListener("page-title-updated", handleTitleUpdate);
        webview.removeEventListener(
          "page-favicon-updated",
          handleFaviconUpdate
        );
      };
    });
  }, [tabs, selectedTabId, updateTab]);

  const handleUrl = () => {
    const webview = webviewRefs.current.get(selectedTabId);
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
    updateTab(selectedTabId, { url: finalUrl });
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
    webviewRefs.current.get(selectedTabId)?.goBack();
  };

  const handleForward = () => {
    webviewRefs.current.get(selectedTabId)?.goForward();
  };

  const handleRefresh = () => {
    webviewRefs.current.get(selectedTabId)?.reload();
  };

  const handleSearch = () => {
    const searchUrl = "https://www.google.com/";
    const webview = webviewRefs.current.get(selectedTabId);
    if (urlInputRef.current) {
      urlInputRef.current.value = searchUrl;
    }
    if (webview) {
      webview.src = searchUrl;
    }
    updateTab(selectedTabId, { url: searchUrl });
  };

  const handleHome = () => {
    const homeUrl = "https://vinely.ai";
    const webview = webviewRefs.current.get(selectedTabId);
    if (webview) {
      webview.src = homeUrl;
    }
    if (urlInputRef.current) {
      urlInputRef.current.value = homeUrl;
    }
    updateTab(selectedTabId, { url: homeUrl });
  };

  const handleChat = () => {
    if (!isChatOpen) {
      toggleChat();
    } else {
      toggleChat();
    }
  };

  return (
    <>
      <PandioTabsSidebar />
      <SidebarInset>
        <div
          id="browser-tools"
          className="flex w-full space-x-1 p-3 bg-[#18181b] border-b border-white/10"
        >
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
        <div className="flex flex-1 w-full min-h-0 overflow-hidden">
          <div id="webview-container" className="flex-1 min-h-0 relative">
            {tabs.map((tab) => (
              <webview
                key={tab.id}
                ref={(el) => {
                  if (el) webviewRefs.current.set(tab.id, el);
                  else webviewRefs.current.delete(tab.id);
                }}
                src={tab.url}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                  display: tab.id === selectedTabId ? "flex" : "none",
                }}
              />
            ))}
          </div>
          {isChatOpen && <PandioChat onClose={closeChat} />}
        </div>
      </SidebarInset>
    </>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <SidebarProvider className="h-full" defaultOpen={false}>
        <App />
      </SidebarProvider>
    </React.StrictMode>
  );
}
