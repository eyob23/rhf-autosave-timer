import { createContext, useContext } from "react";
import type { FormRegistry } from "./registry";

export const RegistryContext = createContext<FormRegistry | null>(null);

export function useRegistry() {
  const value = useContext(RegistryContext);
  if (!value) throw new Error("RegistryContext is missing");
  return value;
}
