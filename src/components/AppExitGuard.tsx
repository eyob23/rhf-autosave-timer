import { useEffect } from "react";
import type { FormRegistry } from "../autosave/registry";

export function AppExitGuard({ registry }: { registry: FormRegistry }) {
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!registry.hasUnsavedChanges()) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const visibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      registry.getAll().forEach((controller) => controller.flushBestEffort());
    };

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("visibilitychange", visibilityChange);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, [registry]);

  return null;
}
