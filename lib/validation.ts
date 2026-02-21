export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain an uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
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
  const num = parseFloat(amount);
  if (isNaN(num)) return "Enter a valid amount";
  if (num <= 0) return "Amount must be greater than 0";
  return null;
}

export function validatePostalCode(code: string): string | null {
  if (!code.trim()) return "Postal code is required";
  if (code.length < 3) return "Enter a valid postal code";
  return null;
}

export function validateDateOfBirth(date: string): string | null {
  if (!date) return "Date of birth is required";
  const dob = new Date(date);
  const now = new Date();
  const age = now.getFullYear() - dob.getFullYear();
  if (age < 18) return "You must be at least 18 years old";
  if (age > 120) return "Enter a valid date of birth";
  return null;
}
