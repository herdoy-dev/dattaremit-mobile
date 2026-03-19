import apiClient from "@/lib/api-client";
import type { Transaction } from "@/types/transaction";

export interface TransactionsResponse {
  data: Transaction[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function getRecentTransactions(limit = 4): Promise<Transaction[]> {
  const response = await apiClient.get("/transactions", {
    params: { limit },
  });
  return response.data?.data ?? [];
}

export async function getTransactions(params: {
  cursor?: string;
  limit?: number;
  type?: "sent" | "received";
  search?: string;
}): Promise<TransactionsResponse> {
  const response = await apiClient.get("/transactions", { params });
  return response.data?.data ?? { data: [], hasMore: false };
}
