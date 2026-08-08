import { useEffect, useState } from "react";
import { applicationApi } from "../api/service";
import { store } from "../store";
import { AutoSaveStatus } from "../components/AutoSaveStatus";
import { NavigationGuard } from "../components/NavigationGuard";
import { useRegistry } from "../autosave/RegistryContext";

export function PersonalSection() {
  const { personal } = useRegistry();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const request = store.dispatch(applicationApi.endpoints.getPersonal.initiate());
    void request.unwrap().then((data) => {
      if (!active) return;
      personal.initialize(data);
      setReady(true);
    });
    return () => { active = false; request.unsubscribe(); };
  }, [personal]);

  if (!ready) return <p>Loading section…</p>;

  return (
    <section className="card">
      <NavigationGuard controller={personal} />
      <header className="card__header">
        <div><p className="eyebrow">Section 1</p><h2>Personal information</h2></div>
        <AutoSaveStatus controller={personal} />
      </header>
      <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
        <label>First name<input {...personal.form.register("firstName")} /></label>
        <label>Last name<input {...personal.form.register("lastName")} /></label>
        <label className="full">Email<input type="email" {...personal.form.register("email")} /></label>
      </form>
    </section>
  );
}
