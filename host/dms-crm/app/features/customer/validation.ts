import { CustomerFormData, EmailEntry, PhoneEntry } from "./types";

/** Field key -> message. Entry-list errors are keyed `phone:<id>` / `email:<id>`. */
export type FieldErrors = Record<string, string>;

// Single source of truth for which fields each step demands. Mirrors the
// RequiredLabel / `required` markers the steps actually render, and is shared
// with StepIndicator so the progress bar and the Next guard can never disagree.
export const STEP_REQUIRED_FIELDS: Record<
  number,
  (keyof CustomerFormData)[]
> = {
  1: [
    "first_name",
    "last_name",
    "inquiry_kind",
    "gender",
    "address",
    "country",
    "city",
    "source_type",
    "phone",
  ],
  // Staging a vehicle is optional — the cascade marks nothing required and
  // renders its own empty state.
  2: [],
  // Step 3's requirements live in the phone/email entry lists, not in formData.
  3: [],
};

const FIELD_LABELS: Partial<Record<keyof CustomerFormData, string>> = {
  first_name: "First name",
  last_name: "Last name",
  inquiry_kind: "Inquiry kind",
  gender: "Gender",
  address: "Address",
  country: "Country",
  city: "City",
  source_type: "Source type",
  phone: "Phone",
};

const isBlank = (value: string | undefined) => !value || !value.trim();

/** Fraction of the step's required fields that are filled, for StepIndicator. */
export function getStepProgress(step: number, form: CustomerFormData): number {
  const fields = STEP_REQUIRED_FIELDS[step] ?? [];
  if (!fields.length) return 0;
  return fields.filter((f) => !isBlank(form[f])).length / fields.length;
}

export type StepValidationInput = {
  formData: CustomerFormData;
  phoneEntries: PhoneEntry[];
  emailEntries: EmailEntry[];
};

/**
 * Returns one message per unsatisfied required field. An empty object means the
 * step may be left.
 */
export function validateStep(
  step: number,
  { formData, phoneEntries, emailEntries }: StepValidationInput,
): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of STEP_REQUIRED_FIELDS[step] ?? []) {
    if (isBlank(formData[field])) {
      errors[field] = `${FIELD_LABELS[field] ?? field} is required`;
    }
  }

  if (step === 3) {
    // Every entry is submitted, so a blank row would post an empty contact
    // rather than being ignored — validate all of them, not just the first.
    for (const entry of phoneEntries) {
      if (isBlank(entry.phone)) {
        errors[`phone:${entry.id}`] = "Contact number is required";
      }
    }

    for (const entry of emailEntries) {
      if (isBlank(entry.email)) {
        errors[`email:${entry.id}`] = "Email is required";
      }
    }
  }

  return errors;
}

/** Drops one key, for clearing a field's error as the user edits it. */
export function clearFieldError(
  errors: FieldErrors,
  key: string,
): FieldErrors {
  if (!(key in errors)) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
}

/**
 * Clears step-3 entry errors that the user has since satisfied. Entry rows are
 * replaced wholesale on every keystroke, so there is no single field key to
 * drop — the filled ones are recomputed instead. Only ever removes errors, and
 * returns the same object when nothing changed so no needless render occurs.
 */
export function clearFilledContactErrors(
  errors: FieldErrors,
  phoneEntries: PhoneEntry[],
  emailEntries: EmailEntry[],
): FieldErrors {
  const satisfied = [
    ...phoneEntries.filter((e) => !isBlank(e.phone)).map((e) => `phone:${e.id}`),
    ...emailEntries.filter((e) => !isBlank(e.email)).map((e) => `email:${e.id}`),
  ].filter((key) => key in errors);

  if (!satisfied.length) return errors;

  const next = { ...errors };
  for (const key of satisfied) delete next[key];
  return next;
}
