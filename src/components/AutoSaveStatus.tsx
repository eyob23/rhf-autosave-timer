import type { SectionController } from "../autosave/types";
import { useControllerSnapshot } from "../autosave/useControllerSnapshot";

export function AutoSaveStatus<T>({
  controller,
}: {
  controller: SectionController<T>;
}) {
  const state = useControllerSnapshot(controller);

  const save = () => {
    const request =
      state.status === "error" ? controller.retry() : controller.flush();
    void request.catch(() => undefined);
  };

  const text = (() => {
    switch (state.status) {
      case "dirty":
        return "Unsaved changes";
      case "saving":
        return "Saving…";
      case "saved":
        return state.lastSavedAt
          ? `Saved ${state.lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
          : "Saved";
      case "error":
        return "Couldn’t save";
      default:
        return "All changes saved";
    }
  })();

  const secondsRemaining =
    state.autoSaveRemainingMs === null
      ? null
      : Math.max(1, Math.ceil(state.autoSaveRemainingMs / 1000));

  return (
    <div
      className={`save-status save-status--${state.status}`}
      role="status"
      aria-live="polite"
    >
      <span className="save-status__dot" aria-hidden="true" />
      <span className="save-status__text">
        <span>{text}</span>
        {secondsRemaining !== null && (
          <span className="save-status__countdown">
            <progress
              aria-label="Time until autosave"
              max={1}
              value={state.autoSaveProgress}
            />
            <span aria-hidden="true">Autosaves in {secondsRemaining}s</span>
          </span>
        )}
      </span>
      <button
        className="save-status__button"
        type="button"
        onClick={save}
        disabled={!state.hasUnsavedChanges || state.status === "saving"}
      >
        {state.status === "error" ? "Retry" : "Save"}
      </button>
    </div>
  );
}
