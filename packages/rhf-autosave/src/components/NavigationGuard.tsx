import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { useControllerSnapshot } from "../useControllerSnapshot";
import type { SectionController } from "../types";

export function NavigationGuard<T>({
  controller,
}: {
  controller: SectionController<T>;
}) {
  const state = useControllerSnapshot(controller);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      state.hasUnsavedChanges &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    if (!state.hasUnsavedChanges) {
      blocker.proceed();
      return;
    }

    let active = true;
    void controller
      .flush()
      .then(() => {
        if (active && blocker.state === "blocked") blocker.proceed();
      })
      .catch(() => {
        // The save status surfaces the error while navigation remains blocked.
      });

    return () => {
      active = false;
    };
  }, [blocker, controller, state.hasUnsavedChanges]);

  return null;
}