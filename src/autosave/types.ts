export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export type AutoSaveSnapshot = {
  status: SaveStatus;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  error: unknown | null;
};

export type SectionController<T> = {
  initialize(data: T): void;
  flush(): Promise<void>;
  flushBestEffort(): void;
  retry(): Promise<void>;
  hasUnsavedChanges(): boolean;
  getSnapshot(): AutoSaveSnapshot;
  subscribe(listener: () => void): () => void;
  dispose(): void;
};
