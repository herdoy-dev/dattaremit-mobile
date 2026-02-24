export type FilterType = "all" | "sent" | "received";

export interface Transaction {
  id: string;
  name: string;
  type: "sent" | "received";
  /** Pre-formatted display string including currency symbol, e.g. "+$250.00" or "-$50.00" */
  amount: string;
  date: string;
  category?: string;
}
