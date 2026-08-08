import { useFieldArray } from "react-hook-form";
import type { EducationForm } from "../api/mockApi";
import { applicationApi, runApiRequest } from "../api/service";
import { store } from "../store";
import { useApplicationId } from "../useApplicationId";
import { AutoSaveStatus, useAutosaveSection } from "rhf-autosave";
import { NavigationGuard } from "rhf-autosave/react-router";

export function EducationSection() {
  const applicationId = useApplicationId();
  return <EducationFormSection key={applicationId} applicationId={applicationId} />;
}

function EducationFormSection({ applicationId }: { applicationId: string }) {
  const { controller, form, ready, loadError } = useAutosaveSection<EducationForm>({
    id: `${applicationId}:education`,
    defaultValues: { highestLevel: "", currentlyStudying: false, entries: [] },
    load: (signal) => runApiRequest(store.dispatch(applicationApi.endpoints.getEducation.initiate(applicationId)), signal),
    save: (values, signal) => runApiRequest(store.dispatch(applicationApi.endpoints.updateEducation.initiate({ applicationId, values })), signal),
  });
  const entries = useFieldArray({ control: form.control, name: "entries", keyName: "fieldId" });

  if (loadError) return <p role="alert">Could not load education history.</p>;
  if (!ready) return <p className="loading">Loading education history…</p>;

  return (
    <section className="section-panel">
      <NavigationGuard controller={controller} />
      <header className="section-header">
        <div><p className="eyebrow">Section 4 of 4</p><h2>Education</h2><p>Qualifications used to assess this application.</p></div>
        <AutoSaveStatus controller={controller} />
      </header>
      <form onSubmit={(event) => event.preventDefault()}>
        <fieldset className="form-block">
          <legend>Education overview</legend>
          <div className="form-grid">
            <label>Highest level completed<select {...form.register("highestLevel")}><option value="">Select a level</option><option value="secondary">Secondary school</option><option value="certificate">Certificate or diploma</option><option value="bachelors">Bachelor&apos;s degree</option><option value="postgraduate">Postgraduate degree</option></select></label>
            <label className="choice choice--standalone"><input type="checkbox" {...form.register("currentlyStudying")} /> Currently enrolled in study</label>
          </div>
        </fieldset>
        <fieldset className="form-block">
          <div className="legend-row"><legend>Qualifications</legend><button className="secondary-button" type="button" onClick={() => entries.append({ id: crypto.randomUUID(), institution: "", qualification: "", fieldOfStudy: "", graduationYear: new Date().getFullYear() })}><span aria-hidden="true">+</span> Add qualification</button></div>
          <div className="array-list">{entries.fields.map((entry, index) => (
            <div className="array-row" key={entry.fieldId}>
              <div className="array-row__header"><strong>Qualification {index + 1}</strong><button className="icon-button" type="button" aria-label={`Remove qualification ${index + 1}`} onClick={() => entries.remove(index)}>×</button></div>
              <input type="hidden" {...form.register(`entries.${index}.id`)} />
              <div className="form-grid">
                <label>Institution<input {...form.register(`entries.${index}.institution`)} /></label>
                <label>Qualification<input {...form.register(`entries.${index}.qualification`)} /></label>
                <label>Field of study<input {...form.register(`entries.${index}.fieldOfStudy`)} /></label>
                <label>Graduation year<input type="number" min="1950" max="2100" {...form.register(`entries.${index}.graduationYear`, { valueAsNumber: true })} /></label>
              </div>
            </div>
          ))}</div>
        </fieldset>
      </form>
    </section>
  );
}