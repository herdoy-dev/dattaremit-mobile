export interface AccountUser {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  nationality: string;
  dateOfBirth: string;
  referCode?: string;
}

export interface AccountAddress {
  id: string;
  type: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export type AccountStatus = "INITIAL" | "PENDING" | "ACTIVE" | "REJECTED";

export interface AccountStatusResponse {
  data: {
    user: AccountUser | null;
    addresses: AccountAddress[];
    accountStatus: AccountStatus;
  };
}
