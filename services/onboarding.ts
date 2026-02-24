import apiClient from "@/lib/api-client";
import { COUNTRIES } from "@/lib/countries";
import type { AccountStatusResponse } from "@/types/api";
import { splitPhoneNumber } from "@/lib/phone-utils";

export interface ProfilePayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  nationality: string;
  referredByCode?: string;
  clerkUserId: string;
  email: string;
}

export interface DepositAccountPayload {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  type: string;
}

export interface AddressPayload {
  country: string;
  city: string;
  street: string;
  postalCode: string;
  state: string;
}

export const onboardingService = {
  async submitProfile(payload: ProfilePayload) {
    const { prefix, number } = splitPhoneNumber(payload.phoneNumber);
    const dateOfBirth = new Date(payload.dateOfBirth).toISOString();

    const response = await apiClient.post("/users", {
      clerkUserId: payload.clerkUserId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      dateOfBirth,
      phoneNumberPrefix: prefix,
      phoneNumber: number,
      nationality: payload.nationality,
      ...(payload.referredByCode ? { referredByCode: payload.referredByCode } : {}),
    });

    return response.data;
  },

  async submitAddress(payload: AddressPayload) {
    const response = await apiClient.post("/onboarding/address", {
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
    const response = await apiClient.post("/onboarding/kyc");
    return response.data;
  },

  async getAccountStatus(): Promise<AccountStatusResponse> {
    const response = await apiClient.get("/account");
    return response.data;
  },

  async addDepositAccount(payload: DepositAccountPayload) {
    const response = await apiClient.post("/zynk/deposit-account", payload);
    return response.data;
  },

  async requestReferCode() {
    const response = await apiClient.post("/referral/request-code");
    return response.data;
  },

  async validateReferralCode(code: string): Promise<{ valid: boolean }> {
    const response = await apiClient.post("/referral/validate", { code });
    return response.data?.data;
  },
};
