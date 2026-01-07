import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useBoundStore } from "@/store/useBoundStore";
import { Button } from "@/components/ui/button";
import {
  FileIcon,
  PlusIcon,
  XIcon,
  CheckCircleIcon,
  CircleIcon,
} from "lucide-react";

export function PandioTabsSidebar() {
  const tabs = useBoundStore((state) => state.tabs.items);
  const selectedTabId = useBoundStore((state) => state.tabs.selectedTabId);
  const setSelectedTab = useBoundStore((state) => state.tabs.setSelectedTab);
  const removeTab = useBoundStore((state) => state.tabs.remove);
  const addTab = useBoundStore((state) => state.tabs.add);

  // File state
  const files = useBoundStore((state) => state.files.items);
  const addFile = useBoundStore((state) => state.files.add);
  const removeFile = useBoundStore((state) => state.files.remove);
  const toggleContext = useBoundStore((state) => state.files.toggleContext);

  const handleAddFile = async () => {
    try {
      console.log("Opening file dialog...");
      const result = await window.electronAPI.openFileDialog();
      console.log("Dialog result:", result);

      if (result.canceled || result.filePaths.length === 0) {
        console.log("File dialog was canceled or no files selected");
        return;
      }

      for (const filePath of result.filePaths) {
        console.log("Reading file:", filePath);
        const fileData = await window.electronAPI.readFile(filePath);
        console.log("File data:", fileData);

        if (fileData.success) {
          addFile({
            name: fileData.name!,
            path: filePath,
            content: fileData.content!,
            size: fileData.size!,
            type: getMimeType(fileData.name!),
            useAsContext: true, // Default to using as context
          });
          console.log("File added successfully:", fileData.name);
        } else {
          console.error("Failed to read file:", fileData.error);
        }
      }
    } catch (error) {
      console.error("Error in handleAddFile:", error);
    }
  };

  const getMimeType = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      txt: "text/plain",
      md: "text/markdown",
      json: "application/json",
      js: "text/javascript",
      ts: "text/typescript",
      tsx: "text/typescript",
      py: "text/x-python",
      html: "text/html",
      css: "text/css",
      csv: "text/csv",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    return mimeTypes[ext || ""] || "text/plain";
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="border-1 border-[#18181b]"
    >
      <SidebarHeader className="bg-[#18181b] p-2">
        <div className="flex gap-2">
          <Button
            onClick={() => addTab()}
            variant="ghost"
            size="sm"
            className="flex-1 justify-center text-white/70 hover:text-white hover:bg-[#27272a]"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            New Tab
          </Button>
          <Button
            onClick={handleAddFile}
            variant="ghost"
            size="sm"
            className="flex-1 justify-center text-white/70 hover:text-white hover:bg-[#27272a]"
          >
            <FileIcon className="mr-2 h-4 w-4" />
            Add File
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#18181b] p-2">
        {/* Tabs Section */}
        <div className="flex flex-col gap-1">
          <div className="text-white/70 text-sm font-medium">Tabs</div>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setSelectedTab(tab)}
              className={`group flex items-center justify-between px-3 py-2 rounded cursor-pointer ${
                selectedTabId === tab.id
                  ? "bg-[#27272a] text-white"
                  : "text-white/70 hover:text-white hover:bg-[#27272a]/50"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {tab.favicon ? (
                  <img
                    src={tab.favicon}
                    alt=""
                    className="w-4 h-4 flex-shrink-0"
                  />
                ) : (
                  <div className="w-4 h-4 flex-shrink-0 bg-white/20 rounded" />
                )}
                <span className="text-sm truncate">{tab.name || tab.url}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Files Section */}
        <div className="flex flex-col gap-1 mt-4">
          <div className="text-white/70 text-sm font-medium">
            Files ({files.filter((f) => f.useAsContext).length} added to
            context)
          </div>
          {files.map((file) => (
            <div
              key={file.id}
              className="group flex items-center justify-between px-3 py-2 rounded cursor-pointer text-white/70 hover:text-white hover:bg-[#27272a]/50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Toggle context checkbox */}
                <button
                  onClick={() => toggleContext(file.id)}
                  className="flex-shrink-0"
                  title={
                    file.useAsContext ? "Remove from context" : "Add to context"
                  }
                >
                  {file.useAsContext ? (
                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <CircleIcon className="h-4 w-4 text-white/40" />
                  )}
                </button>
                <FileIcon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate" title={file.path}>
                  {file.name}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
          {files.length === 0 && (
            <div className="text-white/40 text-xs px-3 py-2">
              No files added. Click "Add File" to upload.
            </div>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="flex bg-[#18181b]" />
    </Sidebar>
  );
}
