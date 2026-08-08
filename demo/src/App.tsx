import { useMemo } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppExitGuard,
  RegistryContext,
  createFormRegistry,
} from "rhf-autosave";
import { applicationApi } from "./api/service";
import { useApplicationId } from "./useApplicationId";

export function WizardLayout() {
  const applicationId = useApplicationId();
  return <ApplicationShell key={applicationId} applicationId={applicationId} />;
}

function ApplicationShell({ applicationId }: { applicationId: string }) {
  const registry = useMemo(() => createFormRegistry(), []);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: summary } = applicationApi.useGetSummaryQuery(applicationId);
  const currentSection = location.pathname.split("/").at(-1) ?? "personal";

  return (
    <RegistryContext.Provider value={registry}>
      <AppExitGuard registry={registry} />
      <div className="shell">
        <aside>
          <div className="brand"><span className="brand__mark" aria-hidden="true">RH</span><div><strong>Redwood Housing</strong><span>Applications</span></div></div>
          <div className="record-picker">
            <label htmlFor="application-picker">Application record</label>
            <select id="application-picker" value={applicationId} onChange={(event) => navigate(`/applications/${event.target.value}/${currentSection}`)}>
              <option value="app-1042">RH-2026-1042 · Ada Lovelace</option>
              <option value="app-2077">RH-2026-2077 · Grace Hopper</option>
            </select>
          </div>
          <nav aria-label="Application sections">
            <NavLink to="personal"><span>1</span><div>Personal<small>Identity and contact</small></div></NavLink>
            <NavLink to="employment"><span>2</span><div>Employment<small>Work and income</small></div></NavLink>
            <NavLink to="household"><span>3</span><div>Household<small>Members and housing</small></div></NavLink>
            <NavLink to="education"><span>4</span><div>Education<small>Qualifications</small></div></NavLink>
          </nav>
          <div className="sidebar-footer"><span>Application ID</span><code>{applicationId}</code></div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div><p>Applications / {summary?.reference ?? "Loading"}</p><h1>{summary?.applicantName ?? "Application"}</h1></div>
            <span className="status-badge"><span aria-hidden="true" />{summary?.status ?? "Loading"}</span>
          </header>
          <main><Outlet /></main>
        </div>
      </div>
    </RegistryContext.Provider>
  );
}
