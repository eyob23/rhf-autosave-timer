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
import { HouseholdSection } from "./sections/HouseholdSection";
import { EducationSection } from "./sections/EducationSection";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import "rhf-autosave/styles.css";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/applications/:applicationId",
    element: <WizardLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="personal" replace /> },
      { path: "personal", element: <PersonalSection /> },
      { path: "employment", element: <EmploymentSection /> },
      { path: "household", element: <HouseholdSection /> },
      { path: "education", element: <EducationSection /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/applications/app-1042/personal" replace />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
