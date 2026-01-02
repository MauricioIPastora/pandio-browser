import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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

  // Auto-refresh when tab changes
  useEffect(() => {
    refreshContent();
  }, [activeTabId, refreshContent]);

  // Optional: Listen for navigation events within the same tab
  useEffect(() => {
    const webview = getWebview();
    if (!webview) return;

    const handleNavigation = () => {
      // Small delay to let page load
      setTimeout(refreshContent, 500);
    };

    webview.addEventListener("did-finish-load", handleNavigation);
    return () => {
      webview.removeEventListener("did-finish-load", handleNavigation);
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

// Custom hook for consuming the context
export function usePageContext() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePageContext must be used within a PageContextProvider");
  }
  return context;
}
