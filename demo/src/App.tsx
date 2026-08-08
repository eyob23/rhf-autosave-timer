import { useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  AppExitGuard,
  RegistryContext,
  createFormRegistry,
} from "rhf-autosave";

export function WizardLayout() {
  const registry = useMemo(() => createFormRegistry(), []);

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
