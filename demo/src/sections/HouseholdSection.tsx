import { useFieldArray } from "react-hook-form";
import type { HouseholdForm } from "../api/mockApi";
import { applicationApi, runApiRequest } from "../api/service";
import { store } from "../store";
import { useApplicationId } from "../useApplicationId";
import { AutoSaveStatus, useAutosaveSection } from "rhf-autosave";
import { NavigationGuard } from "rhf-autosave/react-router";

export function HouseholdSection() {
  const applicationId = useApplicationId();
  return <HouseholdFormSection key={applicationId} applicationId={applicationId} />;
}

function HouseholdFormSection({ applicationId }: { applicationId: string }) {
  const { controller, form, ready, loadError } = useAutosaveSection<HouseholdForm>({
    id: `${applicationId}:household`,
    defaultValues: { maritalStatus: "single", housingStatus: "rent", members: [] },
    load: (signal) => runApiRequest(store.dispatch(applicationApi.endpoints.getHousehold.initiate(applicationId)), signal),
    save: (values, signal) => runApiRequest(store.dispatch(applicationApi.endpoints.updateHousehold.initiate({ applicationId, values })), signal),
  });
  const members = useFieldArray({ control: form.control, name: "members", keyName: "fieldId" });

  if (loadError) return <p role="alert">Could not load household information.</p>;
  if (!ready) return <p className="loading">Loading household information…</p>;

  return (
    <section className="section-panel">
      <NavigationGuard controller={controller} />
      <header className="section-header">
        <div><p className="eyebrow">Section 3 of 4</p><h2>Household</h2><p>Living arrangements and everyone included in this application.</p></div>
        <AutoSaveStatus controller={controller} />
      </header>
      <form onSubmit={(event) => event.preventDefault()}>
        <fieldset className="form-block">
          <legend>Living arrangement</legend>
          <div className="form-grid">
            <label>Marital status<select {...form.register("maritalStatus")}><option value="single">Single</option><option value="married">Married</option><option value="partnered">Domestic partnership</option><option value="separated">Separated</option></select></label>
            <label>Housing status<select {...form.register("housingStatus")}><option value="rent">Renting</option><option value="own">Homeowner</option><option value="family">Living with family</option><option value="other">Other</option></select></label>
          </div>
        </fieldset>
        <fieldset className="form-block">
          <div className="legend-row"><legend>Household members</legend><button className="secondary-button" type="button" onClick={() => members.append({ id: crypto.randomUUID(), name: "", relationship: "", dateOfBirth: "", dependent: false })}><span aria-hidden="true">+</span> Add member</button></div>
          <div className="array-list">{members.fields.map((member, index) => (
            <div className="array-row" key={member.fieldId}>
              <div className="array-row__header"><strong>Member {index + 1}</strong><button className="icon-button" type="button" aria-label={`Remove household member ${index + 1}`} onClick={() => members.remove(index)}>×</button></div>
              <input type="hidden" {...form.register(`members.${index}.id`)} />
              <div className="form-grid form-grid--three">
                <label>Full name<input {...form.register(`members.${index}.name`)} /></label>
                <label>Relationship<input {...form.register(`members.${index}.relationship`)} /></label>
                <label>Date of birth<input type="date" {...form.register(`members.${index}.dateOfBirth`)} /></label>
                <label className="choice choice--standalone"><input type="checkbox" {...form.register(`members.${index}.dependent`)} /> Financial dependent</label>
              </div>
            </div>
          ))}</div>
        </fieldset>
      </form>
    </section>
  );
}