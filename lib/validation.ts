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
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Must contain a special character";
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} is required`;
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return "Phone number is required";
  const phoneRegex = /^\+?[\d\s-]{8,15}$/;
  if (!phoneRegex.test(phone)) return "Enter a valid phone number";
  return null;
}

export function validateAmount(amount: string): string | null {
  if (!amount.trim()) return "Amount is required";
  if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
    return "Enter a valid amount (max 2 decimal places)";
  }
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return "Amount must be greater than 0";
  if (num < 1) return "Minimum transfer amount is $1.00";
  if (num > 10000) return "Maximum transfer amount is $10,000";
  return null;
}

export function validatePostalCode(code: string): string | null {
  if (!code.trim()) return "Postal code is required";
  if (code.length < 3) return "Enter a valid postal code";
  return null;
}

export function validateAccountNumber(value: string): string | null {
  if (!value.trim()) return "Account number is required";
  if (!/^\d{8,18}$/.test(value.trim()))
    return "Account number must be 8-18 digits";
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
