import { useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { AppExitGuard } from "./components/AppExitGuard";
import { RegistryContext } from "./autosave/RegistryContext";
import { createFormRegistry } from "./autosave/registry";

export function WizardLayout() {
  const registry = useMemo(() => createFormRegistry(), []);

  // Do not dispose this registry from an effect cleanup. In React StrictMode,
  // development effects run setup -> cleanup -> setup, which would permanently
  // dispose an external controller that is intentionally reused across the remount.
  // Scope/dispose registries at the request/workflow owner boundary in the real app.

  return (
    <RegistryContext.Provider value={registry}>
      <AppExitGuard registry={registry} />
      <div className="shell">
        <aside>
          <h1>Application</h1>
          <p className="muted">Production autosave demo</p>
          <nav>
            <NavLink to="personal">Personal</NavLink>
            <NavLink to="employment">Employment</NavLink>
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </RegistryContext.Provider>
  );
}
