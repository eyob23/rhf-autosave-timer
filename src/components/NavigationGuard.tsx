import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import type { SectionController } from "../autosave/types";
import { useControllerSnapshot } from "../autosave/useControllerSnapshot";

export function NavigationGuard<T>({ controller }: { controller: SectionController<T> }) {
  const state = useControllerSnapshot(controller);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      state.hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    // This also handles a successful manual Retry after an earlier failed flush.
    if (!state.hasUnsavedChanges) {
      blocker.proceed();
      return;
    }

    let active = true;
    void controller.flush()
      .then(() => {
        if (active && blocker.state === "blocked") blocker.proceed();
      })
      .catch(() => {
        // Save notification shows the error; keep the user on the current route.
      });

    return () => { active = false; };
  }, [blocker, controller, state.hasUnsavedChanges]);

  return null;
}
