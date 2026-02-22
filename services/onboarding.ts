import { getClerkInstance } from "@clerk/clerk-expo";
import { api } from "./api";
import { COUNTRIES } from "@/lib/countries";

export interface ProfilePayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  nationality: string;
}

export interface AddressPayload {
  country: string;
  city: string;
  street: string;
  postalCode: string;
  state: string;
}

// Sort dial codes longest-first so "+880" matches before "+8"
const dialCodesSorted = [...COUNTRIES].sort(
  (a, b) => b.dial.length - a.dial.length
);

function splitPhoneNumber(fullPhone: string): {
  prefix: string;
  number: string;
} {
  const trimmed = fullPhone.trim();
  for (const country of dialCodesSorted) {
    if (trimmed.startsWith(country.dial)) {
      return {
        prefix: country.dial,
        number: trimmed.slice(country.dial.length).replace(/\D/g, ""),
      };
    }
  }
  // Fallback: try to extract prefix manually
  const match = trimmed.match(/^(\+\d{1,4})(\d+)$/);
  if (match) return { prefix: match[1], number: match[2] };
  return { prefix: "+1", number: trimmed.replace(/\D/g, "") };
}

export const onboardingService = {
  async submitProfile(payload: ProfilePayload) {
    const clerk = getClerkInstance();
    const clerkUserId = clerk.user?.id;
    const email = clerk.user?.primaryEmailAddress?.emailAddress;

    if (!clerkUserId || !email) {
      throw new Error("User session not available. Please sign in again.");
    }

    const { prefix, number } = splitPhoneNumber(payload.phoneNumber);

    // Convert date to ISO format for server
    const dateOfBirth = new Date(payload.dateOfBirth).toISOString();

    const response = await api.post("/users", {
      clerkUserId,
      email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      dateOfBirth,
      phoneNumberPrefix: prefix,
      phoneNumber: number,
      nationality: payload.nationality,
    });

    return response.data;
  },

  async submitAddress(payload: AddressPayload) {
    const response = await api.post("/onboarding/address", {
      type: "PRESENT",
      addressLine1: payload.street,
      city: payload.city,
      state: payload.state,
      country: payload.country,
      postalCode: payload.postalCode,
    });

    return response.data;
  },

  async requestKycLink() {
    const response = await api.post("/onboarding/kyc");
    return response.data;
  },

  async getAccountStatus() {
    const response = await api.get("/account");
    return response.data;
  },
};
