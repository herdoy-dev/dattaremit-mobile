// import { api } from "./api";

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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const onboardingService = {
  async submitProfile(_payload: ProfilePayload) {
    await delay(500);
    return { success: true };
  },

  async submitAddress(_payload: AddressPayload) {
    await delay(500);
    return { success: true };
  },

  async requestKycLink() {
    await delay(500);
    return { success: true };
  },
};
