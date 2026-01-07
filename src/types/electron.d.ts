interface ElectronAPI {
  openFileDialog: () => Promise<{
    canceled: boolean;
    filePaths: string[];
  }>;
  readFile: (filePath: string) => Promise<{
    success: boolean;
    content?: string;
    size?: number;
    name?: string;
    error?: string;
  }>;
  // Window control functions for custom title bar
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
