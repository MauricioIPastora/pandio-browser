import { FileInfo } from "@/types/file";
import { produce } from "immer";
import { StateCreator } from "zustand";

export interface FilesSlice {
  files: {
    items: FileInfo[];
    add: (file: Omit<FileInfo, "id" | "addedAt">) => void;
    remove: (id: string) => void;
    toggleContext: (id: string) => void;
    getContextFiles: () => FileInfo[];
  };
}

export const createFileSlice: StateCreator<FilesSlice, [], [], FilesSlice> = (
  set,
  get
) => ({
  files: {
    items: [],

    add: (file) => {
      set(
        produce((state: FilesSlice) => {
          state.files.items.push({
            ...file,
            id: crypto.randomUUID(),
            addedAt: Date.now(),
          });
        })
      );
    },

    remove: (id) => {
      set(
        produce((state: FilesSlice) => {
          state.files.items = state.files.items.filter((f) => f.id !== id);
        })
      );
    },

    toggleContext: (id) => {
      set(
        produce((state: FilesSlice) => {
          const file = state.files.items.find((f) => f.id === id);
          if (file) {
            file.useAsContext = !file.useAsContext;
          }
        })
      );
    },

    getContextFiles: () => {
      return get().files.items.filter((f) => f.useAsContext);
    },
  },
});
