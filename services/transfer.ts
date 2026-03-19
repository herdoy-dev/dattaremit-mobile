import apiClient from "@/lib/api-client";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
}

export interface SendMoneyPayload {
  contactId: string;
  amountCents: number;
  note?: string;
  _idempotencyKey?: string;
}

export interface SendMoneyResponse {
  success: boolean;
  transactionId: string;
  timestamp: string;
}

export interface ReceiveInfo {
  accountId: string;
  email: string;
  phone: string;
  name: string;
}

export async function searchContacts(query: string): Promise<Contact[]> {
  const response = await apiClient.get("/contacts", {
    params: { q: query },
  });
  return response.data?.data ?? [];
}

export async function sendMoney(payload: SendMoneyPayload): Promise<SendMoneyResponse> {
  const { _idempotencyKey, ...body } = payload;
  const response = await apiClient.post("/transfers/send", body, {
    headers: _idempotencyKey ? { "Idempotency-Key": _idempotencyKey } : undefined,
  });
  return response.data?.data;
}

export async function getReceiveInfo(): Promise<ReceiveInfo> {
  const response = await apiClient.get("/transfers/receive-info");
  return response.data?.data;
}
