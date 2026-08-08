# rhf-autosave

Section-based, whole-value autosave controllers for React Hook Form.

## Install

```bash
npm install rhf-autosave react react-hook-form
```

Install `react-router-dom` as well when using the optional navigation guard.

## Usage

Create one registry at the workflow boundary:

```tsx
import {
  AppExitGuard,
  RegistryContext,
  createFormRegistry,
} from "rhf-autosave";
import { useState } from "react";
import "rhf-autosave/styles.css";

function Application() {
  const [registry] = useState(createFormRegistry);
  return (
    <RegistryContext.Provider value={registry}>
      <AppExitGuard registry={registry} />
      <PersonalSection />
    </RegistryContext.Provider>
  );
}
```

Create one controller per independently persisted section. Both loading and saving operate on the complete section value:

```tsx
import { AutoSaveStatus, useAutosaveSection } from "rhf-autosave";

type PersonalForm = {
  firstName: string;
  lastName: string;
};

function PersonalSection() {
  const { controller, form, ready, loadError } =
    useAutosaveSection<PersonalForm>({
      id: "personal",
      defaultValues: { firstName: "", lastName: "" },
      load: (signal) => loadPersonal(signal),
      save: (values, signal) => savePersonal(values, signal),
      debounceMs: 20_000,
    });

  if (loadError) return <p>Could not load section.</p>;
  if (!ready) return <p>Loading...</p>;

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <AutoSaveStatus controller={controller} />
      <input {...form.register("firstName")} />
      <input {...form.register("lastName")} />
    </form>
  );
}
```

Use `useControllerSnapshot(controller)` to render save state without subscribing the form section to React Hook Form state. The registry provides `flush(id)`, `flushAll()`, `getAll()`, and `hasUnsavedChanges()` for application-level navigation and exit handling.

## React Router

The router integration is a separate entry so core consumers do not load React Router:

```tsx
import { NavigationGuard } from "rhf-autosave/react-router";

function SectionGuards({ controller }: { controller: SectionController<FormValues> }) {
  return <NavigationGuard controller={controller} />;
}
```

`NavigationGuard` requires a React Router data router because it uses `useBlocker()`.
