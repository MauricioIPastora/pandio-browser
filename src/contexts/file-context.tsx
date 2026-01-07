import { createContext, useContext, ReactNode } from "react";
import { useBoundStore } from "@/store/useBoundStore";

interface FileContextValue {
  getFileContextString: () => string;
  contextFilesCount: number;
}

const FileContext = createContext<FileContextValue | null>(null);

export function FileContextProvider({ children }: { children: ReactNode }) {
  const files = useBoundStore((state) => state.files.items);
  const contextFiles = files.filter((f) => f.useAsContext);

  const getFileContextString = () => {
    if (contextFiles.length === 0) return "";

    return contextFiles
      .map(
        (file) =>
          `=== FILE: ${file.name} ===\n${file.content}\n=== END FILE ===`
      )
      .join("\n\n");
  };

  return (
    <FileContext.Provider
      value={{
        getFileContextString,
        contextFilesCount: contextFiles.length,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within FileContextProvider");
  }
  return context;
}
