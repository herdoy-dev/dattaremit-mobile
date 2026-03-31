import { z } from "zod";
import {
  MIN_TRANSFER_AMOUNT,
  MAX_TRANSFER_AMOUNT,
  MIN_ACCOUNT_DIGITS,
  MAX_ACCOUNT_DIGITS,
  MIN_POSTAL_CODE_LENGTH,
} from "@/constants/limits";

// --- Shared field schemas ---

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(10, "Password must be at least 10 characters")
  .max(128, "Password must be under 128 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain a special character");

export const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const PHONE_RULES: Record<string, { length: number; name: string }> = {
  "+1": { length: 10, name: "US" },
  "+91": { length: 10, name: "Indian" },
};

const dialPrefixes = Object.keys(PHONE_RULES).sort((a, b) => b.length - a.length);

export const phoneSchema = z.string().superRefine((phone, ctx) => {
  const trimmed = phone.replace(/[\s-]/g, "");
  if (!trimmed) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number is required" });
    return;
  }

  const matched = dialPrefixes.find((prefix) => trimmed.startsWith(prefix));
  if (!matched) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a supported country code (+1 or +91)",
    });
    return;
  }

  const rule = PHONE_RULES[matched];
  const localNumber = trimmed.slice(matched.length);

  if (!/^\d+$/.test(localNumber)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number must contain only digits" });
    return;
  }
  if (localNumber.length !== rule.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${rule.name} phone number must be ${rule.length} digits`,
    });
    return;
  }
  if (matched === "+1" && ["0", "1"].includes(localNumber[0])) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "US phone number cannot start with 0 or 1",
    });
  }
  if (matched === "+91" && !["6", "7", "8", "9"].includes(localNumber[0])) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Indian phone number must start with 6, 7, 8, or 9",
    });
  }
});

export const amountSchema = z
  .string()
  .trim()
  .min(1, "Amount is required")
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (max 2 decimal places)")
  .refine((v) => parseFloat(v) > 0, "Amount must be greater than 0")
  .refine(
    (v) => parseFloat(v) >= MIN_TRANSFER_AMOUNT,
    `Minimum transfer amount is $${MIN_TRANSFER_AMOUNT.toFixed(2)}`,
  )
  .refine(
    (v) => parseFloat(v) <= MAX_TRANSFER_AMOUNT,
    `Maximum transfer amount is $${MAX_TRANSFER_AMOUNT.toLocaleString()}`,
  );

export const postalCodeSchema = z
  .string()
  .trim()
  .min(1, "Postal code is required")
  .min(MIN_POSTAL_CODE_LENGTH, "Enter a valid postal code");

export const accountNumberSchema = z
  .string()
  .trim()
  .min(1, "Account number is required")
  .regex(
    new RegExp(`^\\d{${MIN_ACCOUNT_DIGITS},${MAX_ACCOUNT_DIGITS}}$`),
    `Account number must be ${MIN_ACCOUNT_DIGITS}-${MAX_ACCOUNT_DIGITS} digits`,
  );

export const ifscSchema = z
  .string()
  .trim()
  .min(1, "Routing number is required")
  .transform((v) => v.toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code (e.g. SBIN0001234)"));

export const dateOfBirthSchema = z
  .string()
  .min(1, "Date of birth is required")
  .superRefine((date, ctx) => {
    const dob = new Date(date);
    if (isNaN(dob.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid date of birth" });
      return;
    }
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "You must be at least 18 years old" });
    }
    if (age > 120) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid date of birth" });
    }
  });

// --- Form schemas ---

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: requiredString("First name"),
  lastName: requiredString("Last name"),
  dateOfBirth: dateOfBirthSchema,
  phoneNumber: phoneSchema,
  nationality: requiredString("Nationality"),
});

export const addressSchema = z.object({
  country: requiredString("Country"),
  state: requiredString("State/Province"),
  city: requiredString("City"),
  street: requiredString("Street address"),
  postalCode: postalCodeSchema,
});

export const bankAccountSchema = z.object({
  bankName: requiredString("Bank name"),
  accountName: requiredString("Account holder name"),
  accountNumber: accountNumberSchema,
  ifsc: ifscSchema,
  branchName: requiredString("Branch name"),
  bankAccountType: requiredString("Account type"),
  phoneNumber: phoneSchema,
});

export const addRecipientSchema = z.object({
  firstName: requiredString("First name"),
  lastName: requiredString("Last name"),
  email: emailSchema,
  phoneNumber: phoneSchema,
  dateOfBirth: dateOfBirthSchema,
  addressLine1: requiredString("Address line 1"),
  addressLine2: z.string().optional(),
  city: requiredString("City"),
  state: requiredString("State"),
  postalCode: postalCodeSchema,
});

export type AddRecipientFormValues = z.infer<typeof addRecipientSchema>;

export const sendMoneySchema = z.object({
  amount: amountSchema,
  note: z.string().optional(),
});

// --- Inferred types ---

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;
export type SendMoneyFormValues = z.infer<typeof sendMoneySchema>;
