import {
  emailSchema,
  passwordSchema,
  requiredString,
  phoneSchema,
  amountSchema,
  postalCodeSchema,
  accountNumberSchema,
  ifscSchema,
  dateOfBirthSchema,
  loginSchema,
  registerSchema,
  profileSchema,
  addressSchema,
  bankAccountSchema,
  sendMoneySchema,
} from "../schemas";

// Helper to get first error message from a Zod parse
function getError(schema: any, value: any): string | undefined {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues[0]?.message;
}

describe("emailSchema", () => {
  it("accepts valid emails", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });

  it("rejects empty", () => {
    expect(getError(emailSchema, "")).toBe("Email is required");
  });

  it("rejects invalid format", () => {
    expect(getError(emailSchema, "notanemail")).toBe("Enter a valid email address");
  });
});

describe("passwordSchema", () => {
  it("accepts valid password", () => {
    expect(passwordSchema.safeParse("MyP@ssw0rd!").success).toBe(true);
  });

  it("rejects empty", () => {
    expect(getError(passwordSchema, "")).toBe("Password is required");
  });

  it("rejects short password", () => {
    expect(getError(passwordSchema, "Ab1!")).toBe("Password must be at least 10 characters");
  });

  it("rejects missing uppercase", () => {
    expect(getError(passwordSchema, "mypassw0rd!")).toBe("Must contain an uppercase letter");
  });

  it("rejects missing lowercase", () => {
    expect(getError(passwordSchema, "MYPASSW0RD!")).toBe("Must contain a lowercase letter");
  });

  it("rejects missing number", () => {
    expect(getError(passwordSchema, "MyPassword!")).toBe("Must contain a number");
  });

  it("rejects missing special char", () => {
    expect(getError(passwordSchema, "MyPassw0rds")).toBe("Must contain a special character");
  });
});

describe("requiredString", () => {
  it("accepts non-empty string", () => {
    expect(requiredString("Name").safeParse("John").success).toBe(true);
  });

  it("rejects empty", () => {
    expect(getError(requiredString("Name"), "")).toBe("Name is required");
    expect(getError(requiredString("Name"), "   ")).toBe("Name is required");
  });
});

describe("phoneSchema", () => {
  it("accepts valid US phone", () => {
    expect(phoneSchema.safeParse("+12345678901").success).toBe(true);
  });

  it("accepts valid Indian phone", () => {
    expect(phoneSchema.safeParse("+919876543210").success).toBe(true);
  });

  it("rejects empty", () => {
    expect(getError(phoneSchema, "")).toBe("Phone number is required");
  });

  it("rejects unsupported code", () => {
    expect(getError(phoneSchema, "+441234567890")).toBe(
      "Select a supported country code (+1 or +91)",
    );
  });

  it("rejects US number starting with 0", () => {
    expect(getError(phoneSchema, "+10234567890")).toBe("US phone number cannot start with 0 or 1");
  });

  it("rejects Indian number not starting with 6-9", () => {
    expect(getError(phoneSchema, "+915234567890")).toBe(
      "Indian phone number must start with 6, 7, 8, or 9",
    );
  });
});

describe("amountSchema", () => {
  it("accepts valid amounts", () => {
    expect(amountSchema.safeParse("100").success).toBe(true);
    expect(amountSchema.safeParse("1.50").success).toBe(true);
  });

  it("rejects empty", () => {
    expect(getError(amountSchema, "")).toBe("Amount is required");
  });

  it("rejects invalid format", () => {
    expect(getError(amountSchema, "abc")).toBe("Enter a valid amount (max 2 decimal places)");
  });

  it("rejects zero", () => {
    expect(getError(amountSchema, "0")).toBe("Amount must be greater than 0");
  });

  it("rejects below minimum", () => {
    expect(getError(amountSchema, "0.50")).toBe("Minimum transfer amount is $1.00");
  });

  it("rejects above maximum", () => {
    expect(getError(amountSchema, "10001")).toBe("Maximum transfer amount is $10,000");
  });
});

describe("postalCodeSchema", () => {
  it("accepts valid codes", () => {
    expect(postalCodeSchema.safeParse("12345").success).toBe(true);
  });

  it("rejects empty", () => {
    expect(getError(postalCodeSchema, "")).toBe("Postal code is required");
  });

  it("rejects too short", () => {
    expect(getError(postalCodeSchema, "AB")).toBe("Enter a valid postal code");
  });
});

describe("accountNumberSchema", () => {
  it("accepts valid account numbers", () => {
    expect(accountNumberSchema.safeParse("12345678").success).toBe(true);
  });

  it("rejects empty", () => {
    expect(getError(accountNumberSchema, "")).toBe("Account number is required");
  });

  it("rejects invalid format", () => {
    expect(getError(accountNumberSchema, "1234567")).toBe("Account number must be 8-18 digits");
  });
});

describe("ifscSchema", () => {
  it("accepts valid IFSC codes", () => {
    const result = ifscSchema.safeParse("SBIN0001234");
    expect(result.success).toBe(true);
  });

  it("accepts lowercase and transforms to uppercase", () => {
    const result = ifscSchema.safeParse("sbin0001234");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("SBIN0001234");
    }
  });

  it("rejects empty", () => {
    expect(getError(ifscSchema, "")).toBe("Routing number is required");
  });

  it("rejects invalid format", () => {
    expect(getError(ifscSchema, "INVALID")).toBe("Enter a valid IFSC code (e.g. SBIN0001234)");
  });
});

describe("dateOfBirthSchema", () => {
  it("accepts valid date for adult", () => {
    expect(dateOfBirthSchema.safeParse("1990-01-01").success).toBe(true);
  });

  it("rejects empty", () => {
    expect(getError(dateOfBirthSchema, "")).toBe("Date of birth is required");
  });

  it("rejects invalid date", () => {
    expect(getError(dateOfBirthSchema, "not-a-date")).toBe("Enter a valid date of birth");
  });

  it("rejects under 18", () => {
    const recent = new Date();
    recent.setFullYear(recent.getFullYear() - 10);
    expect(getError(dateOfBirthSchema, recent.toISOString())).toBe(
      "You must be at least 18 years old",
    );
  });

  it("rejects over 120", () => {
    expect(getError(dateOfBirthSchema, "1850-01-01")).toBe("Enter a valid date of birth");
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "pass" }).success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const data = { email: "a@b.com", password: "MyP@ssw0rd!", confirmPassword: "MyP@ssw0rd!" };
    expect(registerSchema.safeParse(data).success).toBe(true);
  });

  it("rejects password mismatch", () => {
    const data = { email: "a@b.com", password: "MyP@ssw0rd!", confirmPassword: "Different1!" };
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepts valid profile data", () => {
    const data = {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-01",
      phoneNumber: "+12345678901",
      nationality: "US",
    };
    expect(profileSchema.safeParse(data).success).toBe(true);
  });
});

describe("addressSchema", () => {
  it("accepts valid address data", () => {
    const data = {
      country: "US",
      state: "NY",
      city: "New York",
      street: "123 Main St",
      postalCode: "10001",
    };
    expect(addressSchema.safeParse(data).success).toBe(true);
  });
});

describe("bankAccountSchema", () => {
  it("accepts valid bank account data", () => {
    const data = {
      bankName: "SBI",
      accountName: "John Doe",
      accountNumber: "12345678901234",
      ifsc: "SBIN0001234",
      branchName: "Main",
      bankAccountType: "SAVINGS",
      phoneNumber: "+919876543210",
    };
    expect(bankAccountSchema.safeParse(data).success).toBe(true);
  });
});

describe("sendMoneySchema", () => {
  it("accepts valid send data", () => {
    expect(sendMoneySchema.safeParse({ amount: "100" }).success).toBe(true);
    expect(sendMoneySchema.safeParse({ amount: "100", note: "For lunch" }).success).toBe(true);
  });

  it("rejects invalid amount", () => {
    expect(sendMoneySchema.safeParse({ amount: "" }).success).toBe(false);
  });
});
