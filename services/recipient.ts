import apiClient from "@/lib/api-client";

export interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED" | "FAILED";
  hasBankAccount: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  created_at: string;
}

export interface CreateRecipientPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface AddRecipientBankPayload {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branchName: string;
  bankAccountType: string;
  phoneNumber: string;
}

export async function createRecipient(payload: CreateRecipientPayload): Promise<Recipient> {
  const response = await apiClient.post("/recipients", payload);
  return response.data?.data;
}

export async function getRecipients(): Promise<Recipient[]> {
  const response = await apiClient.get("/recipients");
  return response.data?.data ?? [];
}

export async function getRecipient(id: string): Promise<Recipient> {
  const response = await apiClient.get(`/recipients/${id}`);
  return response.data?.data;
}

export async function addRecipientBank(
  id: string,
  payload: AddRecipientBankPayload,
): Promise<Recipient> {
  const response = await apiClient.post(`/recipients/${id}/bank`, payload);
  return response.data?.data;
}

export async function resendRecipientKyc(id: string): Promise<void> {
  await apiClient.post(`/recipients/${id}/resend-kyc`);
}
