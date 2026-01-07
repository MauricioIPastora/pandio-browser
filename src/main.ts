import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import fs from "node:fs/promises";

// Document parsing libraries
import mammoth from "mammoth";
// pdfjs-dist will be imported dynamically to avoid bundling issues

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window with frameless design for custom title bar
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // Remove native frame for custom title bar
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Maximize the window on launch
  mainWindow.maximize();
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "All Supported Files",
        extensions: [
          "txt",
          "md",
          "json",
          "csv",
          "log",
          "pdf",
          "doc",
          "docx",
          "ppt",
          "pptx",
          "xls",
          "xlsx",
          "js",
          "ts",
          "tsx",
          "py",
          "html",
          "css",
        ],
      },
      {
        name: "Documents",
        extensions: ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"],
      },
      { name: "Text Files", extensions: ["txt", "md", "json", "csv", "log"] },
      { name: "Code", extensions: ["js", "ts", "tsx", "py", "html", "css"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  return result;
});

// Helper function to extract text from different file types
async function extractFileContent(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fs.readFile(filePath);

  switch (ext) {
    case ".docx": {
      // mammoth provides best quality for .docx
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    case ".pdf": {
      // pdfjs-dist for PDF parsing
      // Use dynamic import with legacy build for Node.js compatibility
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      
      // Set worker source - try multiple path resolution methods for Electron
      let workerPath: string;
      try {
        // First try: relative to app path (works in packaged Electron apps)
        workerPath = path.join(
          app.getAppPath(),
          "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
        );
        // Check if file exists, if not try alternative
        await fs.access(workerPath);
      } catch {
        // Fallback: relative to current working directory (works in dev)
        workerPath = path.resolve(
          process.cwd(),
          "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
        );
      }
      
      // Convert Windows backslashes to forward slashes for file:// URL
      const normalizedPath = workerPath.replace(/\\/g, "/");
      // Ensure path starts with / on Windows (file:///C:/...)
      const fileUrl = normalizedPath.startsWith("/")
        ? `file://${normalizedPath}`
        : `file:///${normalizedPath}`;
      
      pdfjs.GlobalWorkerOptions.workerSrc = fileUrl;
      
      // Convert Buffer to Uint8Array as required by pdfjs-dist
      const uint8Array = new Uint8Array(buffer);
      
      const loadingTask = pdfjs.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items from the page
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        
        fullText += pageText + "\n";
      }
      
      return fullText.trim();
    }
    
    default: {
      // Plain text files
      return buffer.toString("utf-8");
    }
  }
}

ipcMain.handle("file:read", async (_, filePath: string) => {
  try {
    const content = await extractFileContent(filePath);
    const stats = await fs.stat(filePath);
    return {
      success: true,
      content,
      size: stats.size,
      name: path.basename(filePath),
    };
  } catch (error) {
    console.error("Error reading file:", filePath, error);
    return { success: false, error: (error as Error).message };
  }
});

// Window control handlers for custom title bar
ipcMain.handle("window:minimize", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle("window:maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle("window:close", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle("window:isMaximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
