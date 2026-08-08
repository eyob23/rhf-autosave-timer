import type { SectionController } from "./types";

export function createFormRegistry() {
  type RegisteredController = Pick<
    SectionController<unknown>,
    "flush" | "flushBestEffort" | "hasUnsavedChanges"
  >;
  const controllers = new Map<string, RegisteredController>();

  return {
    register<T>(id: string, controller: SectionController<T>) {
      if (controllers.has(id)) {
        throw new Error(`Autosave section "${id}" is already registered`);
      }
      controllers.set(id, controller);
      return () => {
        if (controllers.get(id) === controller) controllers.delete(id);
      };
    },
    getAll: () => [...controllers.values()],
    flush: async (id: string) => {
      await controllers.get(id)?.flush();
    },
    flushAll: async () => {
      await Promise.all([...controllers.values()].map((controller) => controller.flush()));
    },
    hasUnsavedChanges: () =>
      [...controllers.values()].some((controller) => controller.hasUnsavedChanges()),
  };
}

export type FormRegistry = ReturnType<typeof createFormRegistry>;
