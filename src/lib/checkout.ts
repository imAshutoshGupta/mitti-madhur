// Checkout input validation.
//
// Client-safe and shared deliberately: the form validates with this schema for
// fast feedback, and the server action validates with the SAME schema before
// touching anything. The client copy is a convenience; the server copy is the
// one that counts. Never rely on the browser having run it.

import { z } from "zod";

/** States and union territories, for the address dropdown. */
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "That name is too long"),
  // Indian mobile numbers are 10 digits starting 6-9. An optional +91 or 0
  // prefix is stripped before validating, because people type both.
  phone: z
    .string()
    .trim()
    .max(20, "Enter a valid 10-digit Indian mobile number")
    .transform((value) => value.replace(/[\s-]/g, "").replace(/^(\+91|0)/, ""))
    .pipe(
      z
        .string()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    ),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Enter a valid email address")
    .max(120, "That email is too long"),
  line1: z
    .string()
    .trim()
    .min(5, "Please enter your house or flat and street")
    .max(120, "That address line is too long"),
  line2: z.string().trim().max(120, "That address line is too long").optional(),
  landmark: z.string().trim().max(80, "That landmark is too long").optional(),
  city: z
    .string()
    .trim()
    .min(2, "Please enter your city")
    .max(60, "That city name is too long"),
  state: z.enum(INDIAN_STATES, {
    errorMap: () => ({ message: "Please choose your state" }),
  }),
  pincode: z
    .string()
    .trim()
    .max(10, "Enter a valid 6-digit PIN code")
    // Indian PIN codes are 6 digits and never start with 0.
    .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
  notes: z
    .string()
    .trim()
    .max(300, "Please keep delivery notes under 300 characters")
    .optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

/**
 * What the browser is allowed to send: SKUs and quantities, nothing else.
 *
 * No price, no subtotal, no total. The server re-resolves every rupee. A cap
 * on the number of lines bounds the work a single request can cause.
 */
export const checkoutCartSchema = z
  .array(
    z.object({
      sku: z
        .string()
        .trim()
        .regex(/^[A-Z0-9][A-Z0-9-]{1,31}$/, "Unknown item"),
      quantity: z.number().int().min(1).max(10),
    }),
  )
  .min(1, "Your cart is empty")
  .max(50, "That is too many different items for one order");

/** Field-keyed errors the form can render inline. */
export type CheckoutFieldErrors = Partial<
  Record<keyof ShippingAddress | "cart" | "form", string>
>;

export type PlaceOrderResult =
  | { ok: true; token: string; orderNumber: string }
  | { ok: false; errors: CheckoutFieldErrors };
