import type { AccountStatus } from "@/types/api";

export const KYC_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: "Verified",
  PENDING: "Pending",
  INITIAL: "Not Started",
  REJECTED: "Rejected",
};

export const KYC_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
  PENDING: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  INITIAL: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-400" },
  REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
};

export function getKycLabel(status: string | undefined): string {
  return KYC_STATUS_LABELS[status as AccountStatus] ?? "Unknown";
}

export function getKycBadge(status: string | undefined) {
  return KYC_BADGE_STYLES[status ?? ""] ?? KYC_BADGE_STYLES.INITIAL;
}
