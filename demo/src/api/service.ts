import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  api as mockApi,
  type EducationForm,
  type EmploymentForm,
  type HouseholdForm,
  type PersonalForm,
} from "./mockApi";

type AbortableRequest<T> = {
  abort(): void;
  unwrap(): Promise<T>;
  unsubscribe?: () => void;
};

type SectionUpdate<T> = { applicationId: string; values: T };

export async function runApiRequest<T>(
  request: AbortableRequest<T>,
  signal: AbortSignal,
) {
  const abort = () => request.abort();
  if (signal.aborted) abort();
  else signal.addEventListener("abort", abort, { once: true });

  try {
    return await request.unwrap();
  } finally {
    signal.removeEventListener("abort", abort);
    request.unsubscribe?.();
  }
}

const saveSection = async <T>(
  save: (
    applicationId: string,
    values: T,
    signal: AbortSignal,
  ) => Promise<void>,
  body: SectionUpdate<T>,
  signal: AbortSignal,
) => {
  try {
    await save(body.applicationId, body.values, signal);
    return { data: undefined };
  } catch (error) {
    return { error: error as Error };
  }
};

export const applicationApi = createApi({
  reducerPath: "applicationApi",
  baseQuery: fakeBaseQuery<Error>(),
  tagTypes: ["Section"],
  endpoints: (builder) => ({
    getSummary: builder.query<
      Awaited<ReturnType<typeof mockApi.getSummary>>,
      string
    >({
      queryFn: async (applicationId) => ({
        data: await mockApi.getSummary(applicationId),
      }),
    }),
    getPersonal: builder.query<PersonalForm, string>({
      queryFn: async (applicationId) => ({
        data: await mockApi.getPersonal(applicationId),
      }),
      providesTags: (_result, _error, applicationId) => [
        { type: "Section", id: `${applicationId}:personal` },
      ],
    }),
    updatePersonal: builder.mutation<void, SectionUpdate<PersonalForm>>({
      queryFn: (body, context) =>
        saveSection(mockApi.savePersonal, body, context.signal),
      invalidatesTags: (_result, _error, body) => [
        { type: "Section", id: `${body.applicationId}:personal` },
      ],
    }),
    getEmployment: builder.query<EmploymentForm, string>({
      queryFn: async (applicationId) => ({
        data: await mockApi.getEmployment(applicationId),
      }),
      providesTags: (_result, _error, applicationId) => [
        { type: "Section", id: `${applicationId}:employment` },
      ],
    }),
    updateEmployment: builder.mutation<void, SectionUpdate<EmploymentForm>>({
      queryFn: (body, context) =>
        saveSection(mockApi.saveEmployment, body, context.signal),
      invalidatesTags: (_result, _error, body) => [
        { type: "Section", id: `${body.applicationId}:employment` },
      ],
    }),
    getHousehold: builder.query<HouseholdForm, string>({
      queryFn: async (applicationId) => ({
        data: await mockApi.getHousehold(applicationId),
      }),
      providesTags: (_result, _error, applicationId) => [
        { type: "Section", id: `${applicationId}:household` },
      ],
    }),
    updateHousehold: builder.mutation<void, SectionUpdate<HouseholdForm>>({
      queryFn: (body, context) =>
        saveSection(mockApi.saveHousehold, body, context.signal),
      invalidatesTags: (_result, _error, body) => [
        { type: "Section", id: `${body.applicationId}:household` },
      ],
    }),
    getEducation: builder.query<EducationForm, string>({
      queryFn: async (applicationId) => ({
        data: await mockApi.getEducation(applicationId),
      }),
      providesTags: (_result, _error, applicationId) => [
        { type: "Section", id: `${applicationId}:education` },
      ],
    }),
    updateEducation: builder.mutation<void, SectionUpdate<EducationForm>>({
      queryFn: (body, context) =>
        saveSection(mockApi.saveEducation, body, context.signal),
      invalidatesTags: (_result, _error, body) => [
        { type: "Section", id: `${body.applicationId}:education` },
      ],
    }),
  }),
});
