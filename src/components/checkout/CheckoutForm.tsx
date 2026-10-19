"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ShoppingBag, X } from "lucide-react";
import { type ZodError } from "zod";
import { EmptyState } from "~/components/EmptyState";
import { useCart } from "~/components/cart/CartProvider";
import { OrderSummaryPanel } from "~/components/checkout/OrderSummaryPanel";
import { placeOrderAction } from "~/app/checkout/actions";
import {
  INDIAN_STATES,
  shippingAddressSchema,
  type CheckoutFieldErrors,
} from "~/lib/checkout";
import { orderTotals } from "~/lib/orders";
import { formatPrice } from "~/lib/format";

/**
 * Source order of the address fields.
 *
 * Doubles as the error-precedence order: after a failed submit, focus goes to
 * the first field in THIS list that has an error, which is the first one a
 * reader meets on the page. Sorting by whatever order Zod happened to report
 * issues in would occasionally throw focus backwards.
 */
const FIELD_ORDER = [
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

type FieldName = (typeof FIELD_ORDER)[number];
type FormValues = Record<FieldName, string>;

const EMPTY_VALUES: FormValues = {
  fullName: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

function isFieldName(value: unknown): value is FieldName {
  return (
    typeof value === "string" &&
    (FIELD_ORDER as readonly string[]).includes(value)
  );
}

/**
 * Flatten a Zod failure into the same shape the server action returns, so the
 * two sources of truth render through one set of inline slots. Only the first
 * issue per field is kept: three messages stacked under one input is noise.
 */
function fieldErrorsFromZod(error: ZodError): CheckoutFieldErrors {
  const out: CheckoutFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (!isFieldName(key)) continue;
    out[key] ??= issue.message;
  }
  return out;
}

/** Empty optional fields are sent as `undefined`, not "", to match the schema. */
function toPayload(values: FormValues): Record<FieldName, string | undefined> {
  const optional = (value: string) => (value.trim() === "" ? undefined : value);
  return {
    fullName: values.fullName,
    phone: values.phone,
    email: values.email,
    line1: values.line1,
    line2: optional(values.line2),
    landmark: optional(values.landmark),
    city: values.city,
    state: values.state,
    pincode: values.pincode,
    notes: optional(values.notes),
  };
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

/**
 * Everything on /checkout that depends on the stored cart.
 *
 * Four states, in order of precedence:
 *   1. not hydrated      -> skeleton (never the empty state; see below)
 *   2. order just placed -> "taking you to your confirmation"
 *   3. hydrated, no lines -> empty state, no form
 *   4. otherwise          -> the form + the review column
 *
 * State 2 exists because `clearCart()` after a successful order re-renders
 * this component with an empty cart. Without it, the customer would watch
 * their completed checkout flash "there is nothing to check out" for the frame
 * or two before the router reaches the confirmation page.
 */
export function CheckoutForm() {
  const router = useRouter();
  const { lines, totals, hydrated, clearCart, removed, dismissNotice } =
    useCart();
  const uid = useId();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});
  const [pending, setPending] = useState(false);
  const [placed, setPlaced] = useState(false);
  /**
   * Bumped every time a submit is rejected. It keys the alert so the node
   * remounts — a `role="alert"` whose text has not changed since the last
   * failure announces nothing — and it drives the focus effect below.
   */
  const [failureTick, setFailureTick] = useState(0);

  /**
   * Synchronous double-submit latch.
   *
   * `disabled` on the button only takes effect once React has re-rendered, and
   * on a phone a double-tap can deliver the second event before that paint
   * lands — which would place two identical COD orders. A ref flips in the
   * same tick as the first event, so the second one finds the door shut.
   */
  const submitting = useRef(false);
  /**
   * One key for this checkout attempt, generated lazily on first submit and
   * deliberately NOT regenerated on retry.
   *
   * If the order was written but the response was lost (timeout, mobile
   * handover), the customer retries; replaying the same key returns the
   * original order instead of creating a second real COD order.
   */
  const idempotencyKey = useRef("");
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLElement | null>>>({});
  const alertRef = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<FieldName | "alert" | null>(null);

  const registerField = useCallback(
    (name: FieldName, el: HTMLElement | null) => {
      fieldRefs.current[name] = el;
    },
    [],
  );

  // Focus moves from an effect rather than from the submit handler: when the
  // failure is a form- or cart-level one the target is the alert, and that
  // element does not exist until React has rendered the errors.
  useEffect(() => {
    if (failureTick === 0) return;
    const target = focusTarget.current;
    focusTarget.current = null;
    if (target === null) return;
    const el =
      target === "alert" ? alertRef.current : fieldRefs.current[target];
    el?.focus();
  }, [failureTick]);

  const setValue = useCallback((name: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Drop that field's message the moment it is being corrected. A stale
    // error sitting under an input the customer has just fixed reads as a bug.
    setErrors((prev) => {
      // Also drop the banner-level messages: a "we could not reach the server"
      // notice that stays put while the customer edits the form, with no way
      // to dismiss it, reads as a stuck page.
      if (
        prev[name] === undefined &&
        prev.cart === undefined &&
        prev.form === undefined
      ) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      delete next.cart;
      delete next.form;
      return next;
    });
  }, []);

  const fail = useCallback((nextErrors: CheckoutFieldErrors) => {
    setErrors(nextErrors);
    const first = FIELD_ORDER.find((name) => nextErrors[name] !== undefined);
    focusTarget.current = first ?? "alert";
    setFailureTick((n) => n + 1);
    // Re-enable: the order was NOT placed, so the customer must be able to fix
    // and resend.
    submitting.current = false;
    setPending(false);
  }, []);

  const submit = useCallback(async () => {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);

    // Client-side validation is for speed of feedback only. The server runs
    // the very same schema and its answer is the one that counts.
    const parsed = shippingAddressSchema.safeParse(toPayload(values));
    if (!parsed.success) {
      fail(fieldErrorsFromZod(parsed.error));
      return;
    }

    setErrors({});
    idempotencyKey.current ||= crypto.randomUUID();

    // The total the customer is looking at. Sent so the server can REJECT a
    // mismatch — never so it can price anything. /checkout is prerendered with
    // the catalogue baked in, so this page can be showing a pre-deploy price,
    // and with Cash on Delivery there is no payment step to catch it: the
    // rider would simply ask for a different amount than the button promised.
    const expectedTotalInPaise = orderTotals(
      totals.subtotalInPaise,
    ).totalInPaise;

    let result;
    try {
      result = await placeOrderAction(
        // Parsed, not raw: the schema has already normalised the phone number
        // ("+91 98765 43210" -> "9876543210") and trimmed every string.
        parsed.data,
        // SKUs and quantities only. No price, no subtotal, no line total — the
        // server re-resolves every rupee from the catalogue.
        lines.map((line) => ({ sku: line.sku, quantity: line.quantity })),
        idempotencyKey.current,
        expectedTotalInPaise,
      );
    } catch {
      fail({
        form: "We could not confirm whether your order went through. Please do not submit again — call us on +91 12345 67890 and we will check for you.",
      });
      return;
    }

    if (!result.ok) {
      // The server disagreed even though the browser was happy — a stale
      // catalogue, a sold-out SKU, a price change. Its errors are keyed the
      // same way, so they land in the same inline slots, and they always win.
      fail(result.errors);
      // A cart-level rejection means this page is pricing against a catalogue
      // the server has moved on from. Without a refetch the summary keeps
      // showing the old figures, every resubmit fails identically, and even
      // "Edit cart" reuses the same stale layout data — a dead end that only a
      // hard reload escapes.
      if (result.errors.cart !== undefined) router.refresh();
      return;
    }

    // Deliberately outside the try: a throw from router.replace (an aborted
    // navigation) must not be caught and reported as "your order was not
    // placed" when createOrder has already written it to disk.
    setPlaced(true);
    clearCart();
    // `replace`, not `push`: Back from the confirmation must not land on a
    // checkout form whose order has already gone through.
    router.replace(`/order/${result.token}`);
  }, [values, lines, clearCart, router, fail, totals.subtotalInPaise]);

  if (!hydrated) return <CheckoutSkeleton />;

  if (placed) {
    return (
      <div className="mt-8">
        <div
          role="status"
          className="border-line grid place-items-center rounded-xl border bg-white px-6 py-16 text-center"
        >
          <p className="text-ink font-serif text-2xl">Order placed</p>
          <p className="text-muted mt-2 text-sm">
            Taking you to your confirmation...
          </p>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    const soldOutNames = removed
      .filter((entry) => entry.reason !== "reduced")
      .map((entry) => entry.name);
    return (
      <div className="mt-8">
        <EmptyState
          icon={ShoppingBag}
          title={
            soldOutNames.length > 0
              ? "Those items are no longer available"
              : "There is nothing to check out"
          }
          description={
            // Telling someone their cart is empty when it was emptied FOR them
            // reads as the site having lost it. Name what went.
            soldOutNames.length > 0
              ? `${soldOutNames.join(", ")} sold out, so there is nothing left to order. Pick something else and come straight back.`
              : "Your cart is empty, so there is no order to place yet. Pick a block, powder or granule jaggery from the shop and come straight back."
          }
          actionLabel="Browse Jaggery"
          actionHref="/shop"
        />
      </div>
    );
  }

  const fieldErrorCount = FIELD_ORDER.filter(
    (name) => errors[name] !== undefined,
  ).length;

  const alertMessages: string[] = [];
  if (fieldErrorCount > 0) {
    alertMessages.push(
      fieldErrorCount === 1
        ? "1 field needs your attention before we can place this order."
        : `${fieldErrorCount} fields need your attention before we can place this order.`,
    );
  }
  if (errors.cart !== undefined) alertMessages.push(errors.cart);
  if (errors.form !== undefined) alertMessages.push(errors.form);

  const { totalInPaise } = orderTotals(totals.subtotalInPaise);

  const removalNotice =
    removed.length > 0 ? (
      <div className="border-line bg-cream mb-6 rounded-xl border p-4">
        <div className="flex gap-3">
          <AlertTriangle
            className="text-accent mt-0.5 size-5 shrink-0"
            aria-hidden
          />
          <ul className="text-ink min-w-0 flex-1 space-y-1 text-sm">
            {removed.map((entry) => (
              <li key={entry.sku}>
                {entry.reason === "reduced"
                  ? `We reduced ${entry.name} to ${entry.quantity} — that is the maximum per order.`
                  : entry.reason === "out-of-stock"
                    ? `${entry.name} sold out and was removed from this order.`
                    : `${entry.name} is no longer available and was removed from this order.`}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={dismissNotice}
            className="text-muted hover:text-ink focus-visible:ring-brown grid size-10 shrink-0 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <X className="size-4" aria-hidden />
            <span className="sr-only">Dismiss notice</span>
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="mt-8">
      {removalNotice}
      {/* Form first in source order, so mobile stacks details above summary. */}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <form
          noValidate
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="min-w-0"
        >
          {alertMessages.length > 0 && (
            <div
              key={failureTick}
              ref={alertRef}
              role="alert"
              tabIndex={-1}
              className="border-accent bg-card text-ink mb-6 rounded-xl border p-4 text-sm focus:outline-none"
            >
              {alertMessages.map((message, i) => (
                <p key={i} className={i === 0 ? "font-medium" : "mt-1"}>
                  {message}
                </p>
              ))}
            </div>
          )}

          <fieldset className="border-line rounded-xl border bg-white p-5">
            <legend className="text-ink px-1 font-serif text-xl">
              Contact details
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  id={`${uid}-fullName`}
                  name="fullName"
                  label="Full name"
                  value={values.fullName}
                  error={errors.fullName}
                  onChange={setValue}
                  register={registerField}
                  autoComplete="name"
                  maxLength={80}
                />
              </div>

              <TextField
                id={`${uid}-phone`}
                name="phone"
                label="Mobile number"
                hint="10-digit Indian mobile. We only use it for delivery updates."
                value={values.phone}
                error={errors.phone}
                onChange={setValue}
                register={registerField}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
              />

              <TextField
                id={`${uid}-email`}
                name="email"
                label="Email"
                hint="So we can reach you about this order. We do not send confirmation emails yet."
                value={values.email}
                error={errors.email}
                onChange={setValue}
                register={registerField}
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={120}
              />
            </div>
          </fieldset>

          <fieldset className="border-line mt-6 rounded-xl border bg-white p-5">
            <legend className="text-ink px-1 font-serif text-xl">
              Delivery address
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  id={`${uid}-line1`}
                  name="line1"
                  label="House / flat and street"
                  value={values.line1}
                  error={errors.line1}
                  onChange={setValue}
                  register={registerField}
                  autoComplete="address-line1"
                  maxLength={120}
                />
              </div>

              <div className="sm:col-span-2">
                <TextField
                  id={`${uid}-line2`}
                  name="line2"
                  label="Area / locality"
                  optional
                  value={values.line2}
                  error={errors.line2}
                  onChange={setValue}
                  register={registerField}
                  autoComplete="address-line2"
                  maxLength={120}
                />
              </div>

              <div className="sm:col-span-2">
                <TextField
                  id={`${uid}-landmark`}
                  name="landmark"
                  label="Landmark"
                  optional
                  hint="Something nearby that helps the rider find you."
                  value={values.landmark}
                  error={errors.landmark}
                  onChange={setValue}
                  register={registerField}
                  autoComplete="address-line3"
                  maxLength={80}
                />
              </div>

              <TextField
                id={`${uid}-city`}
                name="city"
                label="City"
                value={values.city}
                error={errors.city}
                onChange={setValue}
                register={registerField}
                autoComplete="address-level2"
                maxLength={60}
              />

              <StateSelect
                id={`${uid}-state`}
                value={values.state}
                error={errors.state}
                onChange={setValue}
                register={registerField}
              />

              <TextField
                id={`${uid}-pincode`}
                name="pincode"
                label="PIN code"
                value={values.pincode}
                error={errors.pincode}
                onChange={setValue}
                register={registerField}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
              />

              <div className="sm:col-span-2">
                <TextField
                  id={`${uid}-notes`}
                  name="notes"
                  label="Delivery notes"
                  optional
                  hint="Gate code, preferred time, anything else we should know."
                  value={values.notes}
                  error={errors.notes}
                  onChange={setValue}
                  register={registerField}
                  multiline
                  maxLength={300}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="border-line mt-6 rounded-xl border bg-white p-5">
            <legend className="text-ink px-1 font-serif text-xl">
              Payment
            </legend>

            {/*
              One option, and it is selected. Rendering greyed-out "Card" and
              "UPI" rows that cannot be chosen would only advertise what the
              shop cannot do yet and invite a tap that goes nowhere.
            */}
            <div className="border-line bg-cream rounded-lg border">
              <label
                htmlFor={`${uid}-payment-cod`}
                className="flex min-h-12 items-start gap-3 p-3"
              >
                <input
                  id={`${uid}-payment-cod`}
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked
                  readOnly
                  className="accent-brown focus-visible:ring-brown mt-0.5 size-5 shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
                <span>
                  <span className="text-ink block text-sm font-semibold">
                    Cash on Delivery
                  </span>
                  <span className="text-muted mt-0.5 block text-xs">
                    Pay the delivery partner in cash when your jaggery arrives.
                  </span>
                </span>
              </label>
            </div>

            <p className="text-muted mt-2 text-xs">
              Online payment is coming soon.
            </p>
          </fieldset>

          <button
            type="submit"
            disabled={pending}
            className="bg-brown hover:bg-brown-dark focus-visible:ring-brown mt-6 flex min-h-12 w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending
              ? "Placing your order..."
              : `Place Order - ${formatPrice(totalInPaise)}`}
          </button>

          <p className="text-muted mt-3 text-center text-xs">
            By placing this order you agree to pay in cash on delivery.
          </p>
        </form>

        <OrderSummaryPanel />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

/**
 * One labelled control plus its hint and inline error.
 *
 * The label is a real `<label htmlFor>` every time. Placeholders-as-labels
 * disappear the moment someone starts typing, which is exactly when a form
 * this long needs them most, and they are invisible to most autofill.
 */
function TextField({
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
}: {
  id: string;
  name: FieldName;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  type?: "text" | "tel" | "email";
  inputMode?: "numeric" | "email";
  autoComplete?: string;
  maxLength?: number;
  multiline?: boolean;
  onChange: (name: FieldName, value: string) => void;
  register: (name: FieldName, el: HTMLElement | null) => void;
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

function StateSelect({
  id,
  value,
  error,
  onChange,
  register,
}: {
  id: string;
  value: string;
  error?: string;
  onChange: (name: FieldName, value: string) => void;
  register: (name: FieldName, el: HTMLElement | null) => void;
}) {
  const describedBy = describedByFor(id, error, undefined);
  const invalid = error !== undefined;

  return (
    <FieldShell id={id} label="State" error={error}>
      <select
        id={id}
        name="state"
        value={value}
        required
        autoComplete="address-level1"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange("state", event.target.value)}
        ref={(el) => {
          register("state", el);
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

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/**
 * Shown until the stored cart has been read.
 *
 * Deliberately NOT the empty state: the server cannot see localStorage, so a
 * customer with a full cart would otherwise be told there is nothing to check
 * out for a frame or two before their order appeared.
 */
function CheckoutSkeleton() {
  return (
    <div className="mt-8">
      <div
        aria-hidden
        className="grid items-start gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="min-w-0 space-y-6">
          {[3, 6].map((fieldCount) => (
            <div
              key={fieldCount}
              className="border-line rounded-xl border bg-white p-5"
            >
              <div className="bg-line/60 h-5 w-36 animate-pulse rounded" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {Array.from({ length: fieldCount }, (_, i) => (
                  <div key={i}>
                    <div className="bg-line/60 h-3 w-24 animate-pulse rounded" />
                    <div className="bg-line/60 mt-2 h-11 w-full animate-pulse rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-line/60 h-12 w-full animate-pulse rounded-full" />
        </div>

        <div className="border-line rounded-xl border bg-white p-5 lg:sticky lg:top-24">
          <div className="bg-line/60 h-7 w-40 animate-pulse rounded" />
          <div className="border-line mt-4 space-y-3 border-b pb-4">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-line/60 size-14 shrink-0 animate-pulse rounded-lg" />
                <div className="min-w-0 flex-1">
                  <div className="bg-line/60 h-3 w-2/3 animate-pulse rounded" />
                  <div className="bg-line/60 mt-2 h-3 w-1/3 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="bg-line/60 h-3 w-24 animate-pulse rounded" />
                <div className="bg-line/60 h-3 w-16 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <span role="status" className="sr-only">
        Loading checkout
      </span>
    </div>
  );
}
