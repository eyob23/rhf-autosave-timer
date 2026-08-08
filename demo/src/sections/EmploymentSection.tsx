import type { EmploymentForm } from "../api/mockApi";
import { applicationApi, runApiRequest } from "../api/service";
import { store } from "../store";
import { useApplicationId } from "../useApplicationId";
import { AutoSaveStatus, useAutosaveSection } from "rhf-autosave";
import { NavigationGuard } from "rhf-autosave/react-router";

export function EmploymentSection() {
  const applicationId = useApplicationId();
  return <EmploymentFormSection key={applicationId} applicationId={applicationId} />;
}

function EmploymentFormSection({ applicationId }: { applicationId: string }) {
  const { controller, form, ready, loadError } = useAutosaveSection<EmploymentForm>({
    id: `${applicationId}:employment`,
    defaultValues: {
      status: "employed",
      employer: "",
      title: "",
      startDate: "",
      annualIncome: 0,
      remote: false,
      responsibilities: "",
    },
    load: (signal) => runApiRequest(
      store.dispatch(applicationApi.endpoints.getEmployment.initiate(applicationId)),
      signal,
    ),
    save: (values, signal) => runApiRequest(
      store.dispatch(applicationApi.endpoints.updateEmployment.initiate({ applicationId, values })),
      signal,
    ),
  });

  if (loadError) return <p role="alert">Could not load employment information.</p>;
  if (!ready) return <p className="loading">Loading employment information…</p>;

  return (
    <section className="section-panel">
      <NavigationGuard controller={controller} />
      <header className="section-header">
        <div><p className="eyebrow">Section 2 of 4</p><h2>Employment and income</h2><p>Current work arrangement and annual income details.</p></div>
        <AutoSaveStatus controller={controller} />
      </header>
      <form onSubmit={(event) => event.preventDefault()}>
        <fieldset className="form-block">
          <legend>Current employment</legend>
          <div className="form-grid">
            <label>Employment status<select {...form.register("status")}><option value="employed">Employed</option><option value="self-employed">Self-employed</option><option value="student">Student</option><option value="not-employed">Not employed</option></select></label>
            <label>Employer or business<input {...form.register("employer")} /></label>
            <label>Job title<input {...form.register("title")} /></label>
            <label>Start date<input type="date" {...form.register("startDate")} /></label>
            <label>Annual income<input type="number" min="0" step="1000" {...form.register("annualIncome", { valueAsNumber: true })} /></label>
            <label className="choice choice--standalone"><input type="checkbox" {...form.register("remote")} /> I primarily work remotely</label>
            <label className="full">Primary responsibilities<textarea rows={5} {...form.register("responsibilities")} /></label>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
