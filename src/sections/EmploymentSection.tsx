import { useEffect, useState } from "react";
import { applicationApi } from "../api/service";
import { store } from "../store";
import { AutoSaveStatus } from "../components/AutoSaveStatus";
import { NavigationGuard } from "../components/NavigationGuard";
import { useRegistry } from "../autosave/RegistryContext";

export function EmploymentSection() {
  const { employment } = useRegistry();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const request = store.dispatch(applicationApi.endpoints.getEmployment.initiate());
    void request.unwrap().then((data) => {
      if (!active) return;
      employment.initialize(data);
      setReady(true);
    });
    return () => { active = false; request.unsubscribe(); };
  }, [employment]);

  if (!ready) return <p>Loading section…</p>;

  return (
    <section className="card">
      <NavigationGuard controller={employment} />
      <header className="card__header">
        <div><p className="eyebrow">Section 2</p><h2>Employment</h2></div>
        <AutoSaveStatus controller={employment} />
      </header>
      <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
        <label>Employer<input {...employment.form.register("employer")} /></label>
        <label>Title<input {...employment.form.register("title")} /></label>
        <label>Years<input type="number" {...employment.form.register("years", { valueAsNumber: true })} /></label>
      </form>
    </section>
  );
}
