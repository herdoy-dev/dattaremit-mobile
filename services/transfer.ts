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

const DUMMY_CONTACTS: Contact[] = [
  { id: "1", name: "John Doe", email: "john.doe@email.com", phone: "+1 234 567 8901", country: "US" },
  { id: "2", name: "Jane Smith", email: "jane.smith@email.com", phone: "+1 345 678 9012", country: "US" },
  { id: "3", name: "Carlos Rivera", email: "carlos.r@email.com", phone: "+52 55 1234 5678", country: "MX" },
  { id: "4", name: "Amina Hassan", email: "amina.h@email.com", phone: "+44 20 7946 0958", country: "UK" },
  { id: "5", name: "Priya Patel", email: "priya.p@email.com", phone: "+91 98765 43210", country: "IN" },
  { id: "6", name: "Yuki Tanaka", email: "yuki.t@email.com", phone: "+81 90 1234 5678", country: "JP" },
  { id: "7", name: "Ahmed Ali", email: "ahmed.ali@email.com", phone: "+971 50 123 4567", country: "AE" },
  { id: "8", name: "Sophie Martin", email: "sophie.m@email.com", phone: "+33 6 12 34 56 78", country: "FR" },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
