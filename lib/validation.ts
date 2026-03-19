import {
  MIN_TRANSFER_AMOUNT,
  MAX_TRANSFER_AMOUNT,
  MIN_ACCOUNT_DIGITS,
  MAX_ACCOUNT_DIGITS,
  MIN_POSTAL_CODE_LENGTH,
} from "@/constants/limits";

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 10) return "Password must be at least 10 characters";
  if (password.length > 128) return "Password must be under 128 characters";
  if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Must contain a number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Must contain a special character";
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} is required`;
  return null;
}

const PHONE_RULES: Record<string, { dial: string; length: number; name: string }> = {
  "+1": { dial: "+1", length: 10, name: "US" },
  "+91": { dial: "+91", length: 10, name: "Indian" },
};

// Sorted longest-first so "+91" matches before "+9"
const dialPrefixes = Object.keys(PHONE_RULES).sort((a, b) => b.length - a.length);

export function validatePhone(phone: string): string | null {
  const trimmed = phone.replace(/[\s-]/g, "");
  if (!trimmed) return "Phone number is required";

  const matched = dialPrefixes.find((prefix) => trimmed.startsWith(prefix));
  if (!matched) return "Select a supported country code (+1 or +91)";

  const rule = PHONE_RULES[matched];
  const localNumber = trimmed.slice(matched.length);

  if (!/^\d+$/.test(localNumber)) return "Phone number must contain only digits";
  if (localNumber.length < rule.length)
    return `${rule.name} phone number must be ${rule.length} digits`;
  if (localNumber.length > rule.length)
    return `${rule.name} phone number must be ${rule.length} digits`;

  if (matched === "+1" && ["0", "1"].includes(localNumber[0]))
    return "US phone number cannot start with 0 or 1";

  if (matched === "+91" && !["6", "7", "8", "9"].includes(localNumber[0]))
    return "Indian phone number must start with 6, 7, 8, or 9";

  return null;
}

export function validateAmount(amount: string): string | null {
  if (!amount.trim()) return "Amount is required";
  if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
    return "Enter a valid amount (max 2 decimal places)";
  }
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return "Amount must be greater than 0";
  if (num < MIN_TRANSFER_AMOUNT)
    return `Minimum transfer amount is $${MIN_TRANSFER_AMOUNT.toFixed(2)}`;
  if (num > MAX_TRANSFER_AMOUNT)
    return `Maximum transfer amount is $${MAX_TRANSFER_AMOUNT.toLocaleString()}`;
  return null;
}

export function validatePostalCode(code: string): string | null {
  if (!code.trim()) return "Postal code is required";
  if (code.length < MIN_POSTAL_CODE_LENGTH) return "Enter a valid postal code";
  return null;
}

export function validateAccountNumber(value: string): string | null {
  if (!value.trim()) return "Account number is required";
  const pattern = new RegExp(`^\\d{${MIN_ACCOUNT_DIGITS},${MAX_ACCOUNT_DIGITS}}$`);
  if (!pattern.test(value.trim()))
    return `Account number must be ${MIN_ACCOUNT_DIGITS}-${MAX_ACCOUNT_DIGITS} digits`;
  return null;
}

export function validateRoutingNumber(value: string): string | null {
  if (!value.trim()) return "Routing number is required";
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.trim().toUpperCase()))
    return "Enter a valid IFSC code (e.g. SBIN0001234)";
  return null;
}

export function validateDateOfBirth(date: string): string | null {
  if (!date) return "Date of birth is required";
  const dob = new Date(date);
  if (isNaN(dob.getTime())) return "Enter a valid date of birth";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  if (age < 18) return "You must be at least 18 years old";
  if (age > 120) return "Enter a valid date of birth";
  return null;
}
