export type PersonalForm = {
  firstName: string;
  lastName: string;
  email: string;
};

export type EmploymentForm = {
  employer: string;
  title: string;
  years: number;
};

type Database = {
  personal: PersonalForm;
  employment: EmploymentForm;
};

const STORAGE_KEY = "rhf-autosave-production:data";

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });

const initialDatabase = {
  personal: {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
  } satisfies PersonalForm,
  employment: {
    employer: "Analytical Engines Inc.",
    title: "Engineer",
    years: 5,
  } satisfies EmploymentForm,
} satisfies Database;

const isDatabase = (value: unknown): value is Database => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Database>;
  return (
    typeof candidate.personal?.firstName === "string" &&
    typeof candidate.personal.lastName === "string" &&
    typeof candidate.personal.email === "string" &&
    typeof candidate.employment?.employer === "string" &&
    typeof candidate.employment.title === "string" &&
    typeof candidate.employment.years === "number"
  );
};

const loadDatabase = (): Database => {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isDatabase(parsed)) return parsed;
    }
  } catch {
    // Use the defaults when storage is unavailable or contains invalid JSON.
  }

  return structuredClone(initialDatabase);
};

const persistDatabase = (database: Database) => {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(database));
};

let db = loadDatabase();

export const api = {
  async getPersonal() {
    await sleep(250);
    return structuredClone(db.personal);
  },
  async savePersonal(data: PersonalForm, signal: AbortSignal) {
    await sleep(650, signal);
    const next = { ...db, personal: structuredClone(data) };
    persistDatabase(next);
    db = next;
  },
  async getEmployment() {
    await sleep(250);
    return structuredClone(db.employment);
  },
  async saveEmployment(data: EmploymentForm, signal: AbortSignal) {
    await sleep(650, signal);
    const next = { ...db, employment: structuredClone(data) };
    persistDatabase(next);
    db = next;
  },
};
