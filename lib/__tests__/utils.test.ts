import {
  delay,
  resolveOnboardingStep,
  getApiErrorMessage,
  getClerkErrorMessage,
  hexToRgba,
} from "../utils";
import type { AccountStatusResponse } from "@/types/api";

describe("delay", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("resolves after the specified time", async () => {
    const promise = delay(100);
    jest.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe("resolveOnboardingStep", () => {
  it("returns 'referral' when no user data", () => {
    const data = {
      data: { user: null, addresses: [], accountStatus: "INITIAL", hasBankAccount: false },
    } as AccountStatusResponse;
    expect(resolveOnboardingStep(data)).toBe("referral");
  });

  it("returns 'address' when user exists but no addresses", () => {
    const data = {
      data: {
        user: {
          id: "1",
          clerkUserId: "c1",
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
          phoneNumberPrefix: "+1",
          phoneNumber: "1234567890",
          nationality: "US",
          dateOfBirth: "1990-01-01",
        },
        addresses: [],
        accountStatus: "INITIAL",
        hasBankAccount: false,
      },
    } as AccountStatusResponse;
    expect(resolveOnboardingStep(data)).toBe("address");
  });

  it("returns 'kyc' for INITIAL status with user and address", () => {
    const data = {
      data: {
        user: {
          id: "1",
          clerkUserId: "c1",
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
          phoneNumberPrefix: "+1",
          phoneNumber: "1234567890",
          nationality: "US",
          dateOfBirth: "1990-01-01",
        },
        addresses: [
          {
            id: "1",
            type: "home",
            addressLine1: "123 St",
            city: "NY",
            state: "NY",
            country: "US",
            postalCode: "10001",
          },
        ],
        accountStatus: "INITIAL",
        hasBankAccount: false,
      },
    } as AccountStatusResponse;
    expect(resolveOnboardingStep(data)).toBe("kyc");
  });

  it("returns 'kyc' for REJECTED status", () => {
    const data = {
      data: {
        user: {
          id: "1",
          clerkUserId: "c1",
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
          phoneNumberPrefix: "+1",
          phoneNumber: "1234567890",
          nationality: "US",
          dateOfBirth: "1990-01-01",
        },
        addresses: [
          {
            id: "1",
            type: "home",
            addressLine1: "123 St",
            city: "NY",
            state: "NY",
            country: "US",
            postalCode: "10001",
          },
        ],
        accountStatus: "REJECTED",
        hasBankAccount: false,
      },
    } as AccountStatusResponse;
    expect(resolveOnboardingStep(data)).toBe("kyc");
  });

  it("returns 'completed' for ACTIVE status", () => {
    const data = {
      data: {
        user: {
          id: "1",
          clerkUserId: "c1",
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
          phoneNumberPrefix: "+1",
          phoneNumber: "1234567890",
          nationality: "US",
          dateOfBirth: "1990-01-01",
        },
        addresses: [
          {
            id: "1",
            type: "home",
            addressLine1: "123 St",
            city: "NY",
            state: "NY",
            country: "US",
            postalCode: "10001",
          },
        ],
        accountStatus: "ACTIVE",
        hasBankAccount: true,
      },
    } as AccountStatusResponse;
    expect(resolveOnboardingStep(data)).toBe("completed");
  });

  it("returns 'profile' for unknown account status (default case)", () => {
    const data = {
      data: {
        user: {
          id: "1",
          clerkUserId: "c1",
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
          phoneNumberPrefix: "+1",
          phoneNumber: "1234567890",
          nationality: "US",
          dateOfBirth: "1990-01-01",
        },
        addresses: [
          {
            id: "1",
            type: "home",
            addressLine1: "123 St",
            city: "NY",
            state: "NY",
            country: "US",
            postalCode: "10001",
          },
        ],
        accountStatus: "SOME_UNKNOWN_STATUS",
        hasBankAccount: false,
      },
    } as unknown as AccountStatusResponse;
    expect(resolveOnboardingStep(data)).toBe("profile");
  });

  it("returns 'completed' for PENDING status", () => {
    const data = {
      data: {
        user: {
          id: "1",
          clerkUserId: "c1",
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
          phoneNumberPrefix: "+1",
          phoneNumber: "1234567890",
          nationality: "US",
          dateOfBirth: "1990-01-01",
        },
        addresses: [
          {
            id: "1",
            type: "home",
            addressLine1: "123 St",
            city: "NY",
            state: "NY",
            country: "US",
            postalCode: "10001",
          },
        ],
        accountStatus: "PENDING",
        hasBankAccount: false,
      },
    } as AccountStatusResponse;
    expect(resolveOnboardingStep(data)).toBe("completed");
  });
});

describe("getApiErrorMessage", () => {
  it("extracts message from Axios error response", () => {
    const axiosError = {
      isAxiosError: true,
      response: { data: { message: "Server error" }, status: 500 },
      config: {},
      toJSON: () => ({}),
    };
    // axios.isAxiosError checks for the isAxiosError flag
    expect(getApiErrorMessage(axiosError, "fallback")).toBe("Server error");
  });

  it("returns fallback for Axios error without message", () => {
    const axiosError = {
      isAxiosError: true,
      response: { data: {}, status: 500 },
      config: {},
      toJSON: () => ({}),
    };
    expect(getApiErrorMessage(axiosError, "fallback")).toBe("fallback");
  });

  it("extracts message from standard Error", () => {
    expect(getApiErrorMessage(new Error("Something broke"), "fallback")).toBe("Something broke");
  });

  it("returns fallback for unknown error types", () => {
    expect(getApiErrorMessage("string error", "fallback")).toBe("fallback");
    expect(getApiErrorMessage(42, "fallback")).toBe("fallback");
    expect(getApiErrorMessage(null, "fallback")).toBe("fallback");
  });
});

describe("getClerkErrorMessage", () => {
  it("extracts longMessage from Clerk error", () => {
    const clerkError = {
      errors: [{ longMessage: "Email already exists" }],
    };
    expect(getClerkErrorMessage(clerkError, "fallback")).toBe("Email already exists");
  });

  it("returns fallback for Clerk error without longMessage", () => {
    const clerkError = { errors: [{}] };
    expect(getClerkErrorMessage(clerkError, "fallback")).toBe("fallback");
  });

  it("returns fallback for empty errors array", () => {
    const clerkError = { errors: [] };
    expect(getClerkErrorMessage(clerkError, "fallback")).toBe("fallback");
  });

  it("extracts message from standard Error", () => {
    expect(getClerkErrorMessage(new Error("Auth failed"), "fallback")).toBe("Auth failed");
  });

  it("returns fallback for unknown error types", () => {
    expect(getClerkErrorMessage(null, "fallback")).toBe("fallback");
    expect(getClerkErrorMessage(undefined, "fallback")).toBe("fallback");
    expect(getClerkErrorMessage("string", "fallback")).toBe("fallback");
  });
});

describe("hexToRgba", () => {
  it("converts hex to rgba with given alpha", () => {
    expect(hexToRgba("#FF0000", 1)).toBe("rgba(255, 0, 0, 1)");
    expect(hexToRgba("#00FF00", 0.5)).toBe("rgba(0, 255, 0, 0.5)");
    expect(hexToRgba("#0000FF", 0)).toBe("rgba(0, 0, 255, 0)");
  });

  it("handles lowercase hex", () => {
    expect(hexToRgba("#ff8800", 0.1)).toBe("rgba(255, 136, 0, 0.1)");
  });

  it("handles white and black", () => {
    expect(hexToRgba("#FFFFFF", 1)).toBe("rgba(255, 255, 255, 1)");
    expect(hexToRgba("#000000", 0.5)).toBe("rgba(0, 0, 0, 0.5)");
  });
});
