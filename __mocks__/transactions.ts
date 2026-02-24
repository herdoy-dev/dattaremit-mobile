import type { Transaction } from "@/types/transaction";

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: "1", name: "John Doe", type: "sent", amount: "-$250.00", date: "Today, 2:30 PM" },
  { id: "2", name: "Salary Deposit", type: "received", amount: "+$3,500.00", date: "Yesterday" },
  { id: "3", name: "Netflix", type: "sent", amount: "-$15.99", date: "Feb 18" },
  { id: "4", name: "Jane Smith", type: "received", amount: "+$120.00", date: "Feb 17" },
];

export const ALL_TRANSACTIONS: Transaction[] = [
  { id: "1", name: "John Doe", type: "sent", amount: "-$250.00", date: "Feb 21, 2026", category: "Transfer" },
  { id: "2", name: "Salary Deposit", type: "received", amount: "+$3,500.00", date: "Feb 20, 2026", category: "Income" },
  { id: "3", name: "Netflix", type: "sent", amount: "-$15.99", date: "Feb 18, 2026", category: "Subscription" },
  { id: "4", name: "Jane Smith", type: "received", amount: "+$120.00", date: "Feb 17, 2026", category: "Transfer" },
  { id: "5", name: "Uber Ride", type: "sent", amount: "-$24.50", date: "Feb 16, 2026", category: "Transport" },
  { id: "6", name: "Freelance Payment", type: "received", amount: "+$850.00", date: "Feb 15, 2026", category: "Income" },
  { id: "7", name: "Amazon", type: "sent", amount: "-$67.99", date: "Feb 14, 2026", category: "Shopping" },
  { id: "8", name: "Refund - Store", type: "received", amount: "+$45.00", date: "Feb 13, 2026", category: "Refund" },
  { id: "9", name: "Electricity Bill", type: "sent", amount: "-$89.00", date: "Feb 12, 2026", category: "Utilities" },
  { id: "10", name: "Mike Johnson", type: "received", amount: "+$200.00", date: "Feb 11, 2026", category: "Transfer" },
];
