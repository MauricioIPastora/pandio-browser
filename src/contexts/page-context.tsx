import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { extractPageContent, PageContent } from "../lib/page-extractor";

interface PageContextValue {
  pageContent: PageContent | null;
  isLoading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
}

const PageContext = createContext<PageContextValue | null>(null);

interface PageContextProviderProps {
  children: ReactNode;
  getWebview: () => Electron.WebviewTag | null;
  activeTabId: number;
}

export function PageContextProvider({
  children,
  getWebview,
  activeTabId,
}: PageContextProviderProps) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the current webview to properly clean up listeners
  const webviewRef = useRef<Electron.WebviewTag | null>(null);
  // Track pending timeouts to cancel on cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshContent = useCallback(async () => {
    const webview = getWebview();
    if (!webview) {
      setError("No webview available");
      setPageContent(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await extractPageContent(webview);
      setPageContent(content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to extract content"
      );
      setPageContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [getWebview]);

  // Single useEffect that handles both tab switching AND navigation
  useEffect(() => {
    const webview = getWebview();
    webviewRef.current = webview;

    // Clear any pending timeout from previous tab
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!webview) {
      setPageContent(null);
      return;
    }

    // Fetch immediately on tab change
    refreshContent();

    // Also listen for navigation within this tab
    const handleNavigation = () => {
      // Clear previous timeout if user navigates rapidly
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Delay to let page content render
      timeoutRef.current = setTimeout(refreshContent, 500);
    };

    webview.addEventListener("did-finish-load", handleNavigation);

    return () => {
      // Clean up the specific webview we attached to
      if (webviewRef.current) {
        webviewRef.current.removeEventListener(
          "did-finish-load",
          handleNavigation
        );
      }
      // Cancel any pending refresh
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [activeTabId, getWebview, refreshContent]);

  return (
    <PageContext.Provider
      value={{ pageContent, isLoading, error, refreshContent }}
    >
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePageContext must be used within a PageContextProvider");
  }
  return context;
}
