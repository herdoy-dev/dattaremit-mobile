import { COLORS } from "@/constants/theme";

const SUCCESS_TYPES = [
  "KYC_APPROVED",
  "ACCOUNT_ACTIVATED",
  "TRANSACTION_COMPLETED",
  "REFERRAL_BONUS",
  "PROFILE_UPDATED",
];
const ERROR_TYPES = ["KYC_REJECTED", "KYC_FAILED", "TRANSACTION_FAILED"];
const PENDING_TYPES = ["KYC_PENDING", "TRANSACTION_INITIATED", "SYSTEM_ALERT", "PASSWORD_CHANGED"];

export function getNotificationColor(type?: string): string {
  if (!type) return COLORS.muted;
  if (SUCCESS_TYPES.includes(type)) return COLORS.success;
  if (ERROR_TYPES.includes(type)) return COLORS.error;
  if (PENDING_TYPES.includes(type)) return COLORS.warning;
  if (type === "PROMOTIONAL") return "#3B82F6";
  return COLORS.muted;
}

export function getNotificationRoute(type?: string): string {
  if (!type) return "/notifications";
  if (type.startsWith("KYC_")) return "/(tabs)/account";
  if (type.startsWith("TRANSACTION_")) return "/(tabs)/activity";
  if (type === "ACCOUNT_ACTIVATED") return "/(tabs)";
  if (type === "PROFILE_UPDATED" || type === "PASSWORD_CHANGED") return "/(tabs)/account";
  return "/notifications";
}

export function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}
