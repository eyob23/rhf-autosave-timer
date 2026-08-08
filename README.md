# React Hook Form Autosave — production pattern

A working example of section-based autosave using:

- React Hook Form `createFormControl()`
- RHF `subscribe()` for change detection without rerendering the section
- Debounced whole-section saves
- Revision tracking to handle edits while a save is in flight
- One in-flight request per section
- `flush()` before React Router SPA navigation via `useBlocker`
- `beforeunload` protection for reload/tab close
- `visibilitychange` best-effort flush for mobile/backgrounding
- `useSyncExternalStore` for isolated save notifications
- retry on save failure
- RTK Query dispatch from the external controller (no mutation hook in the form component)

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL and edit either section. The mock API waits ~650ms so the save-state transitions are visible.

## RTK Query

The demo already uses RTK Query. `src/autosave/registry.ts` dispatches endpoint `initiate()` actions directly from the external autosave controller and awaits `.unwrap()`. Replace `src/api/service.ts`'s mock `queryFn` endpoints with your real `fetchBaseQuery`/custom base query endpoints.

## Why revision tracking instead of `formState.isDirty`?

RHF `isDirty` means values differ from default values; it is not the same as “has not been persisted yet.” Autosave needs persistence state. The controller increments a revision for each value change and only marks a revision persisted after the corresponding request succeeds.

## Navigation behavior

`NavigationGuard` uses React Router `useBlocker`. When a route change is attempted with unsaved changes, it blocks the transition, calls `controller.flush()`, and only proceeds after all revisions are saved. If save fails, navigation stays blocked and the status control offers Retry.

Hard reloads/cross-origin exits cannot be safely awaited, so `AppExitGuard` uses `beforeunload` to warn. `visibilitychange` starts a best-effort save for mobile/backgrounding.

## Router requirement

This example uses `createBrowserRouter` + `RouterProvider` (React Router Data Mode). This is required because `useBlocker()` is not available with declarative `<BrowserRouter>` mode.

## React StrictMode note

Do not permanently dispose a `createFormControl` registry from a normal component effect cleanup if the same controller instance is reused. React StrictMode performs a development-only setup/cleanup/setup cycle. In a real application, scope the registry to the request/workflow owner and dispose it only when that owner is actually discarded.
