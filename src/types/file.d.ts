export interface FileInfo {
  id: string;
  name: string;
  path: string;
  content: string;
  size: number;
  type: string; // MIME type
  addedAt: number; // timestamp
  useAsContext: boolean; // whether to include in chat context
}
