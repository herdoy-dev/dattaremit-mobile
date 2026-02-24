import { delay } from "@/lib/utils";
import { DUMMY_CONTACTS } from "@/__mocks__/transfer";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
}

export interface SendMoneyPayload {
  contactId: string;
  amount: number;
  note?: string;
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
  await delay(300);
  if (!query.trim()) return DUMMY_CONTACTS;
  const q = query.toLowerCase();
  return DUMMY_CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
  );
}

export async function sendMoney(payload: SendMoneyPayload): Promise<SendMoneyResponse> {
  await delay(1000);
  return {
    success: true,
    transactionId: `TXN${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
}

export async function getReceiveInfo(): Promise<ReceiveInfo> {
  await delay(500);
  return {
    accountId: "DATTA-2024-8837",
    email: "user@dattaremit.com",
    phone: "+1 555 000 1234",
    name: "User Account",
  };
}
