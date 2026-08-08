import type { SectionController } from "../autosave/types";
import { useControllerSnapshot } from "../autosave/useControllerSnapshot";

export function AutoSaveStatus<T>({ controller }: { controller: SectionController<T> }) {
  const state = useControllerSnapshot(controller);

  const text = (() => {
    switch (state.status) {
      case "dirty": return "Unsaved changes";
      case "saving": return "Saving…";
      case "saved": return state.lastSavedAt
        ? `Saved ${state.lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
        : "Saved";
      case "error": return "Couldn’t save";
      default: return "All changes saved";
    }
  })();

  return (
    <div className={`save-status save-status--${state.status}`} role="status" aria-live="polite">
      <span className="save-status__dot" aria-hidden="true" />
      <span>{text}</span>
      {state.status === "error" && (
        <button type="button" onClick={() => void controller.retry()}>
          Retry
        </button>
      )}
    </div>
  );
}
