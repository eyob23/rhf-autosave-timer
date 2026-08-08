import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { api as mockApi, type EmploymentForm, type PersonalForm } from "./mockApi";

export const applicationApi = createApi({
  reducerPath: "applicationApi",
  baseQuery: fakeBaseQuery<Error>(),
  tagTypes: ["Personal", "Employment"],
  endpoints: (builder) => ({
    getPersonal: builder.query<PersonalForm, void>({
      queryFn: async () => ({ data: await mockApi.getPersonal() }),
      providesTags: ["Personal"],
    }),
    updatePersonal: builder.mutation<void, PersonalForm>({
      queryFn: async (body, apiContext) => {
        try {
          await mockApi.savePersonal(body, apiContext.signal);
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Personal"],
    }),
    getEmployment: builder.query<EmploymentForm, void>({
      queryFn: async () => ({ data: await mockApi.getEmployment() }),
      providesTags: ["Employment"],
    }),
    updateEmployment: builder.mutation<void, EmploymentForm>({
      queryFn: async (body, apiContext) => {
        try {
          await mockApi.saveEmployment(body, apiContext.signal);
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Employment"],
    }),
  }),
});
