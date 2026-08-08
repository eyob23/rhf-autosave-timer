import type { PersonalForm } from "../api/mockApi";
import { applicationApi, runApiRequest } from "../api/service";
import { store } from "../store";
import { useApplicationId } from "../useApplicationId";
import { AutoSaveStatus, useAutosaveSection } from "rhf-autosave";
import { NavigationGuard } from "rhf-autosave/react-router";

export function PersonalSection() {
  const applicationId = useApplicationId();
  return (
    <PersonalFormSection key={applicationId} applicationId={applicationId} />
  );
}

function PersonalFormSection({ applicationId }: { applicationId: string }) {
  const { controller, form, ready, loadError } =
    useAutosaveSection<PersonalForm>({
      id: `${applicationId}:personal`,
      defaultValues: {
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        preferredContact: "email",
        address: { line1: "", line2: "", city: "", region: "", postalCode: "" },
      },
      load: (signal) =>
        runApiRequest(
          store.dispatch(
            applicationApi.endpoints.getPersonal.initiate(applicationId),
          ),
          signal,
        ),
      save: (values, signal) =>
        runApiRequest(
          store.dispatch(
            applicationApi.endpoints.updatePersonal.initiate({
              applicationId,
              values,
            }),
          ),
          signal,
        ),
    });

  if (loadError)
    return <p role="alert">Could not load personal information.</p>;
  if (!ready) return <p className="loading">Loading personal information…</p>;

  return (
    <section className="section-panel">
      <NavigationGuard controller={controller} />
      <header className="section-header">
        <div>
          <p className="eyebrow">Section 1 of 4</p>
          <h2>Personal information</h2>
          <p>Identity, contact details, and residential address.</p>
        </div>
        <AutoSaveStatus controller={controller} />
      </header>
      <form onSubmit={(event) => event.preventDefault()}>
        <fieldset className="form-block">
          <legend>Legal name</legend>
          <div className="form-grid form-grid--three">
            <label>
              First name
              <input
                autoComplete="given-name"
                {...form.register("firstName")}
              />
            </label>
            <label>
              Middle name
              <input
                autoComplete="additional-name"
                {...form.register("middleName")}
              />
            </label>
            <label>
              Last name
              <input
                autoComplete="family-name"
                {...form.register("lastName")}
              />
            </label>
          </div>
        </fieldset>
        <fieldset className="form-block">
          <legend>Contact details</legend>
          <div className="form-grid">
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                autoComplete="tel"
                {...form.register("phone")}
              />
            </label>
            <label>
              Date of birth
              <input type="date" {...form.register("dateOfBirth")} />
            </label>
            <div className="field-group">
              <span>Preferred contact</span>
              <div className="choice-row">
                <label className="choice">
                  <input
                    type="radio"
                    value="email"
                    {...form.register("preferredContact")}
                  />{" "}
                  Email
                </label>
                <label className="choice">
                  <input
                    type="radio"
                    value="phone"
                    {...form.register("preferredContact")}
                  />{" "}
                  Phone
                </label>
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset className="form-block">
          <legend>Residential address</legend>
          <div className="form-grid">
            <label className="full">
              Address line 1
              <input
                autoComplete="address-line1"
                {...form.register("address.line1")}
              />
            </label>
            <label className="full">
              Address line 2 <span className="optional">Optional</span>
              <input
                autoComplete="address-line2"
                {...form.register("address.line2")}
              />
            </label>
            <label>
              City
              <input
                autoComplete="address-level2"
                {...form.register("address.city")}
              />
            </label>
            <label>
              State / region
              <input
                autoComplete="address-level1"
                {...form.register("address.region")}
              />
            </label>
            <label>
              Postal code
              <input
                autoComplete="postal-code"
                {...form.register("address.postalCode")}
              />
            </label>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
