import apiClient from "@/lib/api-client";

export interface SendMoneyPayload {
  recipientId: string;
  amountCents: number;
  note?: string;
  _idempotencyKey?: string;
}

export interface SendMoneyResponse {
  transactionId: string;
  zynkTransactionId: string;
  status: string;
  quote: {
    sendAmount: { amount: number; currency: string };
    receiveAmount: { amount: number; currency: string };
    exchangeRate: { rate: number; conversion: string };
    fees: { amount: number; currency: string };
  };
}

export async function sendMoney(payload: SendMoneyPayload): Promise<SendMoneyResponse> {
  const { _idempotencyKey, ...body } = payload;
  const response = await apiClient.post("/transfers/send", body, {
    headers: _idempotencyKey ? { "Idempotency-Key": _idempotencyKey } : undefined,
  });
  return response.data?.data;
}
