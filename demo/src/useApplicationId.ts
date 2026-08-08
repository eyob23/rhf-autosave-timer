import { useParams } from "react-router-dom";

export function useApplicationId() {
  const { applicationId } = useParams();
  if (!applicationId) throw new Error("Application ID is missing from the route");
  return applicationId;
}