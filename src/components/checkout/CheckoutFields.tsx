"use client";

import { type ReactNode } from "react";
import { INDIAN_STATES } from "~/lib/checkout";

/**
 * Source order of the address fields.
 *
 * Doubles as the error-precedence order: after a failed submit, focus goes to
 * the first field in THIS list that has an error, which is the first one a
 * reader meets on the page. Sorting by whatever order Zod happened to report
 * issues in would occasionally throw focus backwards.
 */
export const FIELD_ORDER = [
  "fullName",
  "phone",
  "email",
  "line1",
  "line2",
  "landmark",
  "city",
  "state",
  "pincode",
  "notes",
] as const;

/**
 * Derived from FIELD_ORDER on purpose: a field missing from that list cannot
 * be rendered (compile error). If it could, its validation error would have
 * no slot to render in and submit would silently do nothing.
 */
export type FieldName = (typeof FIELD_ORDER)[number];

/**
 * What every field needs from the form: its identity, its current value and
 * error, and the callbacks that report edits and register the element for
 * focus. CheckoutForm builds this once per field so each field's JSX only
 * states what is specific to it.
 */
export type FieldBinding = {
  id: string;
  name: FieldName;
  value: string;
  error?: string;
  onChange: (name: FieldName, value: string) => void;
  register: (name: FieldName, el: HTMLElement | null) => void;
};

/**
 * One labelled control plus its hint and inline error.
 *
 * The label is a real `<label htmlFor>` every time. Placeholders-as-labels
 * disappear the moment someone starts typing, which is exactly when a form
 * this long needs them most, and they are invisible to most autofill.
 */
export function TextField({
  id,
  name,
  label,
  value,
  error,
  hint,
  optional = false,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  multiline = false,
  onChange,
  register,
}: FieldBinding & {
  label: string;
  hint?: string;
  optional?: boolean;
  type?: "text" | "tel" | "email";
  inputMode?: "numeric" | "email";
  autoComplete?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  const describedBy = describedByFor(id, error, hint);
  const invalid = error !== undefined;

  return (
    <FieldShell
      id={id}
      label={label}
      optional={optional}
      hint={hint}
      error={error}
    >
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={3}
          value={value}
          maxLength={maxLength}
          required={!optional}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(name, event.target.value)}
          ref={(el) => {
            register(name, el);
          }}
          className={controlClass(invalid)}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          required={!optional}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(name, event.target.value)}
          ref={(el) => {
            register(name, el);
          }}
          className={controlClass(invalid)}
        />
      )}
    </FieldShell>
  );
}

export function StateSelect({
  id,
  name,
  value,
  error,
  onChange,
  register,
}: FieldBinding) {
  const describedBy = describedByFor(id, error, undefined);
  const invalid = error !== undefined;

  return (
    <FieldShell id={id} label="State" error={error}>
      <select
        id={id}
        name={name}
        value={value}
        required
        autoComplete="address-level1"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(name, event.target.value)}
        ref={(el) => {
          register(name, el);
        }}
        className={controlClass(invalid)}
      >
        {/* Empty rather than pre-selecting a state: a wrong address that was
            never typed is worse than one the customer has to choose. */}
        <option value="">Choose your state</option>
        {INDIAN_STATES.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function FieldShell({
  id,
  label,
  optional = false,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-ink block text-sm font-medium">
        {label}
        {optional && (
          <span className="text-muted font-normal"> (optional)</span>
        )}
      </label>

      <div className="mt-1.5">{children}</div>

      {hint !== undefined && error === undefined && (
        <p id={`${id}-hint`} className="text-muted mt-1 text-xs">
          {hint}
        </p>
      )}
      {error !== undefined && (
        <p id={`${id}-error`} className="text-accent mt-1 text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The hint is dropped from the description once there is an error: a screen
 * reader reads `aria-describedby` in order, and burying "Enter a valid
 * 10-digit Indian mobile number" behind a sentence of advice the customer has
 * already failed to follow helps nobody.
 */
function describedByFor(
  id: string,
  error: string | undefined,
  hint: string | undefined,
): string | undefined {
  if (error !== undefined) return `${id}-error`;
  if (hint !== undefined) return `${id}-hint`;
  return undefined;
}

function controlClass(invalid: boolean): string {
  // Exactly ONE border-colour utility is emitted. Emitting both and relying on
  // class order does not work — CSS source order decides, `border-line` wins,
  // and an invalid field renders pixel-identical to a valid one with the error
  // text as its only signal.
  return `text-ink placeholder:text-muted focus-visible:ring-brown block min-h-11 w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
    invalid ? "border-accent" : "border-line"
  }`;
}
