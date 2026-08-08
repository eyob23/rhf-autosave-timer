import type { EmploymentForm } from "../api/mockApi";
import { applicationApi, runApiRequest } from "../api/service";
import { store } from "../store";
import { AutoSaveStatus, useAutosaveSection } from "rhf-autosave";
import { NavigationGuard } from "rhf-autosave/react-router";

const loadEmployment = (signal: AbortSignal) =>
  runApiRequest(
    store.dispatch(applicationApi.endpoints.getEmployment.initiate()),
    signal,
  );

const saveEmployment = (values: EmploymentForm, signal: AbortSignal) =>
  runApiRequest(
    store.dispatch(applicationApi.endpoints.updateEmployment.initiate(values)),
    signal,
  );

export function EmploymentSection() {
  const { controller, form, ready, loadError } = useAutosaveSection<EmploymentForm>({
    id: "employment",
    defaultValues: { employer: "", title: "", years: 0 },
    load: loadEmployment,
    save: saveEmployment,
  });

  if (loadError) return <p role="alert">Could not load section.</p>;
  if (!ready) return <p>Loading section…</p>;

  return (
    <section className="card">
      <NavigationGuard controller={controller} />
      <header className="card__header">
        <div><p className="eyebrow">Section 2</p><h2>Employment</h2></div>
        <AutoSaveStatus controller={controller} />
      </header>
      <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
        <label>Employer<input {...form.register("employer")} /></label>
        <label>Title<input {...form.register("title")} /></label>
        <label>Years<input type="number" {...form.register("years", { valueAsNumber: true })} /></label>
      </form>
    </section>
  );
}
