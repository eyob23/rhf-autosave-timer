import type { EmploymentForm, PersonalForm } from "../api/mockApi";
import { applicationApi } from "../api/service";
import { store } from "../store";
import { createSectionController } from "./createSectionController";

export function createFormRegistry() {
  const personal = createSectionController<PersonalForm>({
    defaultValues: { firstName: "", lastName: "", email: "" },
    save: async (values, signal) => {
      const request = store.dispatch(
        applicationApi.endpoints.updatePersonal.initiate(values),
      );

      const abort = () => request.abort();
      signal.addEventListener("abort", abort, { once: true });

      try {
        await request.unwrap();
      } finally {
        signal.removeEventListener("abort", abort);
      }
    },
  });

  const employment = createSectionController<EmploymentForm>({
    defaultValues: { employer: "", title: "", years: 0 },
    save: async (values, signal) => {
      const request = store.dispatch(
        applicationApi.endpoints.updateEmployment.initiate(values),
      );

      const abort = () => request.abort();
      signal.addEventListener("abort", abort, { once: true });

      try {
        await request.unwrap();
      } finally {
        signal.removeEventListener("abort", abort);
      }
    },
  });

  const controllers = { personal, employment };

  return {
    ...controllers,
    getAll: () => Object.values(controllers),
    hasUnsavedChanges: () =>
      Object.values(controllers).some((controller) => controller.hasUnsavedChanges()),
    dispose: () => Object.values(controllers).forEach((controller) => controller.dispose()),
  };
}

export type FormRegistry = ReturnType<typeof createFormRegistry>;
