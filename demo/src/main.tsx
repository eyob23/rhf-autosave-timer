import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { store } from "./store";
import { WizardLayout } from "./App";
import { PersonalSection } from "./sections/PersonalSection";
import { EmploymentSection } from "./sections/EmploymentSection";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import "rhf-autosave/styles.css";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/application",
    element: <WizardLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="personal" replace /> },
      { path: "personal", element: <PersonalSection /> },
      { path: "employment", element: <EmploymentSection /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/application/personal" replace />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
