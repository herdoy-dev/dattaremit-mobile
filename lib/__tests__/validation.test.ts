import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  validatePhone,
  validateAmount,
  validatePostalCode,
  validateAccountNumber,
  validateRoutingNumber,
  validateDateOfBirth,
} from "../validation";

describe("validateEmail", () => {
  it("returns error for empty email", () => {
    expect(validateEmail("")).toBe("Email is required");
    expect(validateEmail("   ")).toBe("Email is required");
  });

  it("returns error for invalid email", () => {
    expect(validateEmail("notanemail")).toBe("Enter a valid email address");
    expect(validateEmail("missing@")).toBe("Enter a valid email address");
    expect(validateEmail("@missing.com")).toBe("Enter a valid email address");
    expect(validateEmail("spaces in@email.com")).toBe("Enter a valid email address");
  });

  it("returns null for valid email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
    expect(validateEmail("user+tag@example.co.uk")).toBeNull();
  });
});

describe("validatePassword", () => {
  it("returns error for empty password", () => {
    expect(validatePassword("")).toBe("Password is required");
  });

  it("returns error for short password", () => {
    expect(validatePassword("Abc1!")).toBe("Password must be at least 10 characters");
  });

  it("returns error for long password", () => {
    expect(validatePassword("A".repeat(129) + "a1!")).toBe("Password must be under 128 characters");
  });

  it("returns error for missing uppercase", () => {
    expect(validatePassword("abcdefghij1!")).toBe("Must contain an uppercase letter");
  });

  it("returns error for missing lowercase", () => {
    expect(validatePassword("ABCDEFGHIJ1!")).toBe("Must contain a lowercase letter");
  });

  it("returns error for missing number", () => {
    expect(validatePassword("Abcdefghij!")).toBe("Must contain a number");
  });

  it("returns error for missing special character", () => {
    expect(validatePassword("Abcdefghij1")).toBe("Must contain a special character");
  });

  it("returns null for valid password", () => {
    expect(validatePassword("Abcdefghi1!")).toBeNull();
    expect(validatePassword("MyP@ssw0rd123")).toBeNull();
  });
});

describe("validateConfirmPassword", () => {
  it("returns error for empty confirmation", () => {
    expect(validateConfirmPassword("password", "")).toBe("Please confirm your password");
  });

  it("returns error for mismatched passwords", () => {
    expect(validateConfirmPassword("password1", "password2")).toBe("Passwords do not match");
  });

  it("returns null for matching passwords", () => {
    expect(validateConfirmPassword("same", "same")).toBeNull();
  });
});

describe("validateRequired", () => {
  it("returns error for empty value", () => {
    expect(validateRequired("", "Field")).toBe("Field is required");
    expect(validateRequired("   ", "Name")).toBe("Name is required");
  });

  it("returns null for non-empty value", () => {
    expect(validateRequired("value", "Field")).toBeNull();
  });
});

describe("validatePhone", () => {
  it("returns error for empty phone", () => {
    expect(validatePhone("")).toBe("Phone number is required");
  });

  it("returns error for unsupported country code", () => {
    expect(validatePhone("+44 1234567890")).toBe("Select a supported country code (+1 or +91)");
  });

  it("returns error for non-digit characters in local number", () => {
    expect(validatePhone("+1 abc def ghij")).toBe("Phone number must contain only digits");
  });

  it("returns error for wrong length US number", () => {
    expect(validatePhone("+1 12345")).toBe("US phone number must be 10 digits");
    expect(validatePhone("+1 12345678901")).toBe("US phone number must be 10 digits");
  });

  it("returns error for US number starting with 0 or 1", () => {
    expect(validatePhone("+1 0234567890")).toBe("US phone number cannot start with 0 or 1");
    expect(validatePhone("+1 1234567890")).toBe("US phone number cannot start with 0 or 1");
  });

  it("returns null for valid US number", () => {
    expect(validatePhone("+1 234 567 8901")).toBeNull();
    expect(validatePhone("+12345678901")).toBeNull();
  });

  it("returns error for wrong length Indian number", () => {
    expect(validatePhone("+91 12345")).toBe("Indian phone number must be 10 digits");
  });

  it("returns error for Indian number not starting with 6-9", () => {
    expect(validatePhone("+91 5234567890")).toBe(
      "Indian phone number must start with 6, 7, 8, or 9",
    );
  });

  it("returns null for valid Indian number", () => {
    expect(validatePhone("+91 9876543210")).toBeNull();
    expect(validatePhone("+919876543210")).toBeNull();
  });
});

describe("validateAmount", () => {
  it("returns error for empty amount", () => {
    expect(validateAmount("")).toBe("Amount is required");
    expect(validateAmount("   ")).toBe("Amount is required");
  });

  it("returns error for invalid format", () => {
    expect(validateAmount("abc")).toBe("Enter a valid amount (max 2 decimal places)");
    expect(validateAmount("12.345")).toBe("Enter a valid amount (max 2 decimal places)");
    expect(validateAmount("12.3.4")).toBe("Enter a valid amount (max 2 decimal places)");
  });

  it("returns error for zero or negative", () => {
    expect(validateAmount("0")).toBe("Amount must be greater than 0");
  });

  it("returns error for amount below minimum", () => {
    expect(validateAmount("0.50")).toBe("Minimum transfer amount is $1.00");
  });

  it("returns error for amount above maximum", () => {
    expect(validateAmount("10001")).toBe("Maximum transfer amount is $10,000");
  });

  it("returns null for valid amount", () => {
    expect(validateAmount("1")).toBeNull();
    expect(validateAmount("100.50")).toBeNull();
    expect(validateAmount("10000")).toBeNull();
  });
});

describe("validatePostalCode", () => {
  it("returns error for empty code", () => {
    expect(validatePostalCode("")).toBe("Postal code is required");
    expect(validatePostalCode("   ")).toBe("Postal code is required");
  });

  it("returns error for too short code", () => {
    expect(validatePostalCode("AB")).toBe("Enter a valid postal code");
  });

  it("returns null for valid code", () => {
    expect(validatePostalCode("12345")).toBeNull();
    expect(validatePostalCode("ABC")).toBeNull();
  });
});

describe("validateAccountNumber", () => {
  it("returns error for empty value", () => {
    expect(validateAccountNumber("")).toBe("Account number is required");
    expect(validateAccountNumber("   ")).toBe("Account number is required");
  });

  it("returns error for invalid format", () => {
    expect(validateAccountNumber("1234567")).toBe("Account number must be 8-18 digits");
    expect(validateAccountNumber("12345678901234567890")).toBe(
      "Account number must be 8-18 digits",
    );
    expect(validateAccountNumber("abcdefgh")).toBe("Account number must be 8-18 digits");
  });

  it("returns null for valid account number", () => {
    expect(validateAccountNumber("12345678")).toBeNull();
    expect(validateAccountNumber("123456789012345678")).toBeNull();
  });
});

describe("validateRoutingNumber", () => {
  it("returns error for empty value", () => {
    expect(validateRoutingNumber("")).toBe("Routing number is required");
    expect(validateRoutingNumber("   ")).toBe("Routing number is required");
  });

  it("returns error for invalid IFSC format", () => {
    expect(validateRoutingNumber("INVALID")).toBe("Enter a valid IFSC code (e.g. SBIN0001234)");
    expect(validateRoutingNumber("1234567890A")).toBe("Enter a valid IFSC code (e.g. SBIN0001234)");
  });

  it("returns null for valid IFSC code", () => {
    expect(validateRoutingNumber("SBIN0001234")).toBeNull();
    expect(validateRoutingNumber("sbin0001234")).toBeNull(); // case insensitive
  });
});

describe("validateDateOfBirth", () => {
  it("returns error for empty date", () => {
    expect(validateDateOfBirth("")).toBe("Date of birth is required");
  });

  it("returns error for invalid date", () => {
    expect(validateDateOfBirth("not-a-date")).toBe("Enter a valid date of birth");
  });

  it("returns error for underage (< 18)", () => {
    const recentDate = new Date();
    recentDate.setFullYear(recentDate.getFullYear() - 10);
    expect(validateDateOfBirth(recentDate.toISOString())).toBe("You must be at least 18 years old");
  });

  it("returns error for unrealistic age (> 120)", () => {
    expect(validateDateOfBirth("1880-01-01")).toBe("Enter a valid date of birth");
  });

  it("returns null for valid date of birth", () => {
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 25);
    expect(validateDateOfBirth(validDate.toISOString())).toBeNull();
  });

  it("handles edge case of exactly 18", () => {
    const exactly18 = new Date();
    exactly18.setFullYear(exactly18.getFullYear() - 18);
    expect(validateDateOfBirth(exactly18.toISOString())).toBeNull();
  });
});
