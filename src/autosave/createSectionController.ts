import {
  createFormControl,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import type { AutoSaveSnapshot, SectionController } from "./types";

type SaveFn<T> = (values: T, signal: AbortSignal) => Promise<void>;

type Options<T extends FieldValues> = {
  defaultValues: DefaultValues<T>;
  save: SaveFn<T>;
  debounceMs?: number;
};

export type RhfFormControl<T extends FieldValues> = Omit<
  UseFormReturn<T, unknown, T>,
  "formState"
>;

export type RhfSectionController<T extends FieldValues> =
  SectionController<T> & {
    form: RhfFormControl<T>;
  };

export function createSectionController<T extends FieldValues>({
  defaultValues,
  save,
  debounceMs = 20000,
}: Options<T>): RhfSectionController<T> {
  const created = createFormControl<T, unknown, T>({ defaultValues });
  // createFormControl exposes the standard RHF methods without React-owned formState.
  const form: RhfFormControl<T> = created;

  let initialized = false;
  let disposed = false;
  let revision = 0;
  let savedRevision = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let inFlight: Promise<void> | null = null;
  let abortController: AbortController | null = null;
  let snapshot: AutoSaveSnapshot = {
    status: "idle",
    hasUnsavedChanges: false,
    lastSavedAt: null,
    error: null,
  };

  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((listener) => listener());

  const setSnapshot = (patch: Partial<AutoSaveSnapshot>) => {
    const next = { ...snapshot, ...patch };
    const changed =
      next.status !== snapshot.status ||
      next.hasUnsavedChanges !== snapshot.hasUnsavedChanges ||
      next.lastSavedAt !== snapshot.lastSavedAt ||
      next.error !== snapshot.error;
    snapshot = next;
    if (changed) emit();
  };

  const cancelDebounce = () => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  };

  const updateDirtySnapshot = () => {
    const unsaved = revision > savedRevision || inFlight !== null;
    setSnapshot({
      hasUnsavedChanges: unsaved,
      status: snapshot.error
        ? "error"
        : inFlight
          ? "saving"
          : revision > savedRevision
            ? "dirty"
            : snapshot.lastSavedAt
              ? "saved"
              : "idle",
    });
  };

  const saveLatest = async () => {
    if (disposed || !initialized) return;
    if (inFlight) return inFlight;
    if (revision <= savedRevision) {
      updateDirtySnapshot();
      return;
    }

    const savingRevision = revision;
    const values = form.getValues();
    abortController = new AbortController();
    setSnapshot({ status: "saving", hasUnsavedChanges: true, error: null });

    const promise = (async () => {
      try {
        await save(values, abortController!.signal);
        savedRevision = Math.max(savedRevision, savingRevision);
        setSnapshot({ lastSavedAt: new Date(), error: null });
      } catch (error) {
        if ((error as DOMException)?.name !== "AbortError") {
          setSnapshot({ status: "error", error, hasUnsavedChanges: true });
        }
        throw error;
      } finally {
        inFlight = null;
        abortController = null;
        updateDirtySnapshot();
      }
    })();

    inFlight = promise;
    updateDirtySnapshot();
    return promise;
  };

  const scheduleSave = () => {
    cancelDebounce();
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void saveLatest()
        .then(() => {
          // If edits happened while the request was in flight, persist the newest snapshot.
          if (revision > savedRevision && !disposed) scheduleSave();
        })
        .catch(() => {
          // Error is surfaced through the external snapshot; retry is user-controlled.
        });
    }, debounceMs);
  };

  const unsubscribeForm = created.subscribe({
    formState: { values: true },
    callback: () => {
      if (!initialized || disposed) return;
      revision += 1;
      setSnapshot({ status: "dirty", hasUnsavedChanges: true, error: null });
      scheduleSave();
    },
  });

  const flush = async () => {
    cancelDebounce();
    while (!disposed && (revision > savedRevision || inFlight)) {
      if (inFlight) {
        await inFlight;
        continue;
      }
      await saveLatest();
    }
  };

  return {
    form,

    initialize(data: T) {
      initialized = false;
      cancelDebounce();
      form.reset(data);
      revision = 0;
      savedRevision = 0;
      setSnapshot({
        status: "idle",
        hasUnsavedChanges: false,
        lastSavedAt: null,
        error: null,
      });
      initialized = true;
    },

    flush,

    flushBestEffort() {
      cancelDebounce();
      if (!inFlight && revision > savedRevision) {
        void saveLatest().catch(() => undefined);
      }
    },

    async retry() {
      setSnapshot({ error: null });
      await flush();
    },

    hasUnsavedChanges() {
      return revision > savedRevision || inFlight !== null;
    },

    getSnapshot() {
      return snapshot;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    dispose() {
      disposed = true;
      cancelDebounce();
      abortController?.abort();
      unsubscribeForm();
      listeners.clear();
    },
  };
}
