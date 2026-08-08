# React Hook Form Autosave - package and demo

This npm workspace separates the reusable autosave implementation from its example application:

```text
packages/rhf-autosave/  Publishable React Hook Form autosave package
demo/                   ID-based case-management application example
```

The package provides section-based autosave using:

- React Hook Form `createFormControl()`
- RHF `subscribe()` for change detection without rerendering the section
- Debounced whole-section saves
- Revision tracking to handle edits while a save is in flight
- One in-flight request per section
- A reusable `useAutosaveSection()` hook for loading, registration, and cleanup
- A dynamic registry keyed by section ID
- `useSyncExternalStore` for isolated save notifications
- retry on save failure
- `AutoSaveStatus` with manual save and a visible debounce countdown
- `AppExitGuard` for browser exit and visibility handling
- optional `NavigationGuard` integration for React Router

Each section owns one RHF controller and saves its complete value snapshot. The section is the persistence and concurrency boundary; this pattern intentionally does not generate field-level patches.

The demo adds its form fields, routing layout, route error boundary, Redux, and RTK Query integration. The autosave status UI and lifecycle guards come from `rhf-autosave`.

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL and edit either section. The mock API waits ~650ms so the save-state transitions are visible.

The demo routes each record under `/applications/:applicationId/:section` and includes two isolated application IDs. Personal and employment demonstrate nested values and varied controls; household and education demonstrate complete-section autosave with React Hook Form `useFieldArray()` collections. RTK Query cache tags include both the application ID and section name.

`npm run build` builds the package first and then verifies that the demo consumes its public exports.

## Package

The package is named `rhf-autosave` and declares React and React Hook Form as peer dependencies. Its public exports include:

- `createSectionController()`
- `useAutosaveSection()`
- `createFormRegistry()` and `RegistryContext`
- `useControllerSnapshot()`
- `AutoSaveStatus` and `AppExitGuard`
- `NavigationGuard` from `rhf-autosave/react-router`
- component styles from `rhf-autosave/styles.css`
- controller, snapshot, registry, and option types

Build only the package with:

```bash
npm run build -w rhf-autosave
```

See `packages/rhf-autosave/README.md` for package usage.

## RTK Query

The demo uses RTK Query. Each section provides stable `load` and `save` functions to `useAutosaveSection()`. Those functions dispatch endpoint `initiate()` actions and pass the result through the demo's `runApiRequest()` adapter, which connects the controller's `AbortSignal`, awaits `.unwrap()`, and unsubscribes query requests. Replace `demo/src/api/service.ts`'s mock `queryFn` endpoints with your real `fetchBaseQuery` or custom base query endpoints.

## Adding a section

Create a section component, define its full-value type and stable `load` and `save` functions, then call `useAutosaveSection()` with a unique ID and default values. The hook creates the RHF controller, initializes loaded values, registers it for app-exit handling, and disposes it when the section is actually unmounted.

The dynamic registry also exposes `flush(id)` and `flushAll()` for workflow-level actions. Only mounted sections are registered; route navigation flushes a dirty section before it unmounts.

## Why revision tracking instead of `formState.isDirty`?

RHF `isDirty` means values differ from default values; it is not the same as “has not been persisted yet.” Autosave needs persistence state. The controller increments a revision for each value change and only marks a revision persisted after the corresponding request succeeds.

## Navigation behavior

`NavigationGuard` uses React Router `useBlocker`. When a route change is attempted with unsaved changes, it blocks the transition, calls `controller.flush()`, and only proceeds after all revisions are saved. If save fails, navigation stays blocked and the status control offers Retry.

Hard reloads/cross-origin exits cannot be safely awaited, so `AppExitGuard` uses `beforeunload` to warn. `visibilitychange` starts a best-effort save for mobile/backgrounding.

## Router requirement

This example uses `createBrowserRouter` + `RouterProvider` (React Router Data Mode). This is required because `useBlocker()` is not available with declarative `<BrowserRouter>` mode.

## React StrictMode note

React StrictMode performs a development-only setup/cleanup/setup cycle. `useAutosaveSection()` defers request cancellation and controller disposal by one microtask so the replacement setup can retain the same controller. A real unmount still cancels the load request, unregisters the section, and disposes its controller.
