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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
