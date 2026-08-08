import type { PersonalForm } from "../api/mockApi";
import { applicationApi, runApiRequest } from "../api/service";
import { store } from "../store";
import { AutoSaveStatus } from "../components/AutoSaveStatus";
import { NavigationGuard } from "../components/NavigationGuard";
import { useAutosaveSection } from "../autosave/useAutosaveSection";

const loadPersonal = (signal: AbortSignal) =>
  runApiRequest(
    store.dispatch(applicationApi.endpoints.getPersonal.initiate()),
    signal,
  );

const savePersonal = (values: PersonalForm, signal: AbortSignal) =>
  runApiRequest(
    store.dispatch(applicationApi.endpoints.updatePersonal.initiate(values)),
    signal,
  );

export function PersonalSection() {
  const { controller, form, ready, loadError } = useAutosaveSection<PersonalForm>({
    id: "personal",
    defaultValues: { firstName: "", lastName: "", email: "" },
    load: loadPersonal,
    save: savePersonal,
  });

  if (loadError) return <p role="alert">Could not load section.</p>;
  if (!ready) return <p>Loading section…</p>;

  return (
    <section className="card">
      <NavigationGuard controller={controller} />
      <header className="card__header">
        <div><p className="eyebrow">Section 1</p><h2>Personal information</h2></div>
        <AutoSaveStatus controller={controller} />
      </header>
      <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
        <label>First name<input {...form.register("firstName")} /></label>
        <label>Last name<input {...form.register("lastName")} /></label>
        <label className="full">Email<input type="email" {...form.register("email")} /></label>
      </form>
    </section>
  );
}
