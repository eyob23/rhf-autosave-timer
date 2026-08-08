export type PersonalForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  preferredContact: "email" | "phone";
  address: {
    line1: string;
    line2: string;
    city: string;
    region: string;
    postalCode: string;
  };
};

export type EmploymentForm = {
  status: "employed" | "self-employed" | "student" | "not-employed";
  employer: string;
  title: string;
  startDate: string;
  annualIncome: number;
  remote: boolean;
  responsibilities: string;
};

export type HouseholdForm = {
  maritalStatus: string;
  housingStatus: string;
  members: Array<{
    id: string;
    name: string;
    relationship: string;
    dateOfBirth: string;
    dependent: boolean;
  }>;
};

export type EducationForm = {
  highestLevel: string;
  currentlyStudying: boolean;
  entries: Array<{
    id: string;
    institution: string;
    qualification: string;
    fieldOfStudy: string;
    graduationYear: number;
  }>;
};

export type ApplicationRecord = {
  id: string;
  reference: string;
  applicantName: string;
  status: "In progress" | "Ready for review";
  personal: PersonalForm;
  employment: EmploymentForm;
  household: HouseholdForm;
  education: EducationForm;
};

const STORAGE_KEY = "rhf-autosave-demo:applications-v2";

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

const createApplication = (
  id: string,
  reference: string,
  firstName: string,
  lastName: string,
): ApplicationRecord => ({
  id,
  reference,
  applicantName: `${firstName} ${lastName}`,
  status: "In progress",
  personal: {
    firstName,
    middleName: "",
    lastName,
    email: `${firstName.toLowerCase()}@example.com`,
    phone: "+1 415 555 0142",
    dateOfBirth: "1990-06-15",
    preferredContact: "email",
    address: {
      line1: "12 Market Street",
      line2: "",
      city: "San Francisco",
      region: "CA",
      postalCode: "94105",
    },
  },
  employment: {
    status: "employed",
    employer: "Analytical Engines Inc.",
    title: "Senior Engineer",
    startDate: "2021-03-01",
    annualIncome: 128000,
    remote: true,
    responsibilities: "Lead platform delivery and mentor the engineering team.",
  },
  household: {
    maritalStatus: "single",
    housingStatus: "rent",
    members: [{
      id: crypto.randomUUID(),
      name: `${firstName} ${lastName}`,
      relationship: "Self",
      dateOfBirth: "1990-06-15",
      dependent: false,
    }],
  },
  education: {
    highestLevel: "bachelors",
    currentlyStudying: false,
    entries: [{
      id: crypto.randomUUID(),
      institution: "University of London",
      qualification: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      graduationYear: 2012,
    }],
  },
});

const initialDatabase: Record<string, ApplicationRecord> = {
  "app-1042": createApplication("app-1042", "RH-2026-1042", "Ada", "Lovelace"),
  "app-2077": createApplication("app-2077", "RH-2026-2077", "Grace", "Hopper"),
};

const loadDatabase = (): Record<string, ApplicationRecord> => {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Record<string, ApplicationRecord>;
  } catch {
    // Fall back to seeded demo records.
  }
  return structuredClone(initialDatabase);
};

let database = loadDatabase();

const getApplication = (applicationId: string) => {
  const application = database[applicationId];
  if (!application) throw new Error(`Application ${applicationId} was not found`);
  return application;
};

type SectionName = "personal" | "employment" | "household" | "education";

const updateSection = async <K extends SectionName>(
  applicationId: string,
  section: K,
  values: ApplicationRecord[K],
  signal: AbortSignal,
) => {
  await sleep(650, signal);
  database = {
    ...database,
    [applicationId]: {
      ...getApplication(applicationId),
      [section]: structuredClone(values),
    },
  };
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(database));
};

export const api = {
  async getSummary(applicationId: string) {
    await sleep(150);
    const { id, reference, applicantName, status } = getApplication(applicationId);
    return { id, reference, applicantName, status };
  },
  async getPersonal(applicationId: string) {
    await sleep(250);
    return structuredClone(getApplication(applicationId).personal);
  },
  savePersonal(applicationId: string, values: PersonalForm, signal: AbortSignal) {
    return updateSection(applicationId, "personal", values, signal);
  },
  async getEmployment(applicationId: string) {
    await sleep(250);
    return structuredClone(getApplication(applicationId).employment);
  },
  saveEmployment(applicationId: string, values: EmploymentForm, signal: AbortSignal) {
    return updateSection(applicationId, "employment", values, signal);
  },
  async getHousehold(applicationId: string) {
    await sleep(250);
    return structuredClone(getApplication(applicationId).household);
  },
  saveHousehold(applicationId: string, values: HouseholdForm, signal: AbortSignal) {
    return updateSection(applicationId, "household", values, signal);
  },
  async getEducation(applicationId: string) {
    await sleep(250);
    return structuredClone(getApplication(applicationId).education);
  },
  saveEducation(applicationId: string, values: EducationForm, signal: AbortSignal) {
    return updateSection(applicationId, "education", values, signal);
  },
};
