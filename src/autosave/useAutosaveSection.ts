import { useEffect, useRef, useState } from "react";
import type { DefaultValues, FieldValues } from "react-hook-form";
import { createSectionController } from "./createSectionController";
import { useRegistry } from "./RegistryContext";

type AutosaveSectionOptions<T extends FieldValues> = {
  id: string;
  defaultValues: DefaultValues<T>;
  load(signal: AbortSignal): Promise<T>;
  save(values: T, signal: AbortSignal): Promise<void>;
  debounceMs?: number;
};

export function useAutosaveSection<T extends FieldValues>(
  options: AutosaveSectionOptions<T>,
) {
  const registry = useRegistry();
  const optionsRef = useRef(options);
  const mountedRef = useRef(false);
  const loadAbortRef = useRef<AbortController | null>(null);
  const [controller] = useState(() =>
    createSectionController<T>({
      defaultValues: options.defaultValues,
      save: options.save,
      debounceMs: options.debounceMs,
    }),
  );
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<unknown | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    const unregister = registry.register(optionsRef.current.id, controller);
    return () => {
      mountedRef.current = false;
      unregister();
      queueMicrotask(() => {
        if (!mountedRef.current) controller.dispose();
      });
    };
  }, [controller, registry]);

  useEffect(() => {
    const abortController = new AbortController();
    loadAbortRef.current = abortController;
    setLoadError(null);
    void optionsRef.current.load(abortController.signal).then(
      (data) => {
        if (loadAbortRef.current !== abortController) return;
        controller.initialize(data);
        setReady(true);
      },
      (error) => {
        if (loadAbortRef.current === abortController) setLoadError(error);
      },
    );
    return () => {
      queueMicrotask(() => {
        if (loadAbortRef.current !== abortController) return;
        loadAbortRef.current = null;
        abortController.abort();
      });
    };
  }, [controller]);

  return { controller, form: controller.form, ready, loadError };
}