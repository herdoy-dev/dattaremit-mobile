export type FilterType = "all" | "sent" | "received";

export interface Transaction {
  id: string;
  name: string;
  type: "sent" | "received";
  amount: string;
  date: string;
  category?: string;
}
