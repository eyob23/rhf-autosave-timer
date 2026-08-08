import { useSyncExternalStore } from "react";
import type { SectionController } from "./types";

export function useControllerSnapshot<T>(controller: SectionController<T>) {
  return useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
}
