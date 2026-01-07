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
  MinusIcon,
  SquareIcon,
  XIcon,
  MaximizeIcon,
  PanelLeftIcon,
} from "lucide-react";
import { usePandioSidebar } from "@/hooks/use-sidebar";
import { PandioTabsSidebar } from "./components/pandio-tabs-sidebar";
import useChat from "./hooks/use-chat";
import { PandioChat } from "./components/pandio-chat";
import { useBoundStore } from "@/store/useBoundStore";
import { PageContextProvider } from "./contexts/page-context";
import { useCallback } from "react";
import { FileContextProvider } from "./contexts/file-context";

function App() {
  const tabs = useBoundStore((state) => state.tabs.items);
  const selectedTabId = useBoundStore((state) => state.tabs.selectedTabId);
  const updateTab = useBoundStore((state) => state.tabs.updateTab);

  const webviewRefs = useRef<Map<number, Electron.WebviewTag>>(new Map());
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const currentTab = tabs.find((t) => t.id === selectedTabId);
  const { toggleSidebar } = usePandioSidebar(); // open is true if the sidebar is open, false if it is closed
  const { isChatOpen, toggleChat, closeChat } = useChat();

  // Check window maximize state on mount and when window state changes
  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await window.electronAPI?.isMaximized();
      setIsMaximized(maximized ?? false);
    };
    checkMaximized();

    // Listen for window resize events to update maximize state
    const handleResize = () => {
      checkMaximized();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const getCurrentWebview = useCallback(() => {
    return webviewRefs.current.get(selectedTabId) || null;
  }, [selectedTabId]);

  // Window control handlers
  const handleMinimize = async () => {
    await window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = async () => {
    await window.electronAPI?.maximizeWindow();
    const maximized = await window.electronAPI?.isMaximized();
    setIsMaximized(maximized ?? false);
  };

  const handleClose = async () => {
    await window.electronAPI?.closeWindow();
  };

  return (
    <>
      <FileContextProvider>
        <PageContextProvider
          getWebview={getCurrentWebview}
          activeTabId={selectedTabId}
        >
          <PandioTabsSidebar />
          <SidebarInset>
            {/* Custom Title Bar with Integrated Navbar */}
            <div
              id="title-bar"
              className="flex items-center h-[30px] bg-[#18181b] border-b border-white/10 title-bar-drag"
              style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
            >
              {/* Left side: Sidebar toggle */}
              <div
                className="flex items-center px-2 h-full title-bar-no-drag"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
              >
                <Button
                  onClick={toggleSidebar}
                  size="sm"
                  className="h-6 w-6 p-0 text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-transparent"
                >
                  <PanelLeftIcon className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Center: Browser controls */}
              <div
                id="browser-tools"
                className="flex items-center justify-center flex-1 space-x-1 px-2 h-full title-bar-no-drag"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
              >
                <Button
                  onClick={handleBack}
                  size="sm"
                  className="h-6 w-6 p-0 text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-transparent"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={handleForward}
                  size="sm"
                  className="h-6 w-6 p-0 text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-transparent"
                >
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={handleRefresh}
                  size="sm"
                  className="h-6 w-6 p-0 text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-transparent"
                >
                  <RefreshCwIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="h-6 w-6 p-0 text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-transparent"
                >
                  <SearchIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={handleHome}
                  size="sm"
                  className="h-6 w-6 p-0 text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-transparent"
                >
                  <HomeIcon className="h-3.5 w-3.5" />
                </Button>
                <div id="url-input-container" className="flex items-center gap-1 ml-1">
                  <Input
                    type="text"
                    ref={urlInputRef}
                    onKeyDown={handleKeyDown}
                    className="h-5 text-xs bg-[#27272a] text-[#71717a] border-white/10 hover:bg-[#e4e4e7]/10 focus-visible:ring-0 focus-visible:ring-offset-0 w-[300px]"
                  />
                  <Button
                    onClick={handleChat}
                    size="sm"
                    className="h-6 w-6 p-0 text-[#fafafa] hover:text-[#a1a1aa] hover:bg-[#27272a] bg-transparent"
                  >
                    <MessageCircleIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Right side: Window controls */}
              <div
                className="flex items-center title-bar-no-drag"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
              >
                <Button
                  onClick={handleMinimize}
                  size="sm"
                  className="h-[30px] w-[46px] rounded-none text-[#fafafa] hover:bg-[#27272a] bg-transparent"
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleMaximize}
                  size="sm"
                  className="h-[30px] w-[46px] rounded-none text-[#fafafa] hover:bg-[#27272a] bg-transparent"
                >
                  {isMaximized ? (
                    <SquareIcon className="h-3 w-3" />
                  ) : (
                    <MaximizeIcon className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  size="sm"
                  className="h-[30px] w-[46px] rounded-none text-[#fafafa] hover:bg-[#ff6568] bg-transparent"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-1 w-full min-h-0 overflow-hidden">
              <div id="webview-container" className="flex-1 min-h-0 relative">
                {tabs.map((tab) => (
                  <webview
                    key={tab.id}
                    ref={(el) => {
                      if (el)
                        webviewRefs.current.set(
                          tab.id,
                          el as unknown as Electron.WebviewTag
                        );
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
        </PageContextProvider>
      </FileContextProvider>
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
