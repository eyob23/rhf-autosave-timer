import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function RouteErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected routing error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = typeof error.data === "string" ? error.data : message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main style={{ maxWidth: 760, margin: "48px auto", padding: 24 }}>
      <h1>{title}</h1>
      <p>{message}</p>
      <p>Open the browser console for the full stack trace.</p>
    </main>
  );
}
