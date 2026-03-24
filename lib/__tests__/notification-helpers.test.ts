import {
  getNotificationColor,
  getNotificationRoute,
  formatRelativeTime,
} from "../notification-helpers";
import { COLORS } from "@/constants/theme";

describe("getNotificationColor", () => {
  it("returns muted for undefined type", () => {
    expect(getNotificationColor()).toBe(COLORS.muted);
    expect(getNotificationColor(undefined)).toBe(COLORS.muted);
  });

  it("returns success color for success types", () => {
    for (const type of [
      "KYC_APPROVED",
      "ACCOUNT_ACTIVATED",
      "TRANSACTION_COMPLETED",
      "REFERRAL_BONUS",
    ]) {
      expect(getNotificationColor(type)).toBe(COLORS.success);
    }
  });

  it("returns error color for error types", () => {
    for (const type of ["KYC_REJECTED", "KYC_FAILED", "TRANSACTION_FAILED"]) {
      expect(getNotificationColor(type)).toBe(COLORS.error);
    }
  });

  it("returns warning color for pending types", () => {
    for (const type of ["KYC_PENDING", "TRANSACTION_INITIATED", "SYSTEM_ALERT"]) {
      expect(getNotificationColor(type)).toBe(COLORS.warning);
    }
  });

  it("returns blue for PROMOTIONAL", () => {
    expect(getNotificationColor("PROMOTIONAL")).toBe("#3B82F6");
  });

  it("returns muted for unknown types", () => {
    expect(getNotificationColor("UNKNOWN_TYPE")).toBe(COLORS.muted);
  });
});

describe("getNotificationRoute", () => {
  it("returns /notifications for undefined type", () => {
    expect(getNotificationRoute()).toBe("/notifications");
    expect(getNotificationRoute(undefined)).toBe("/notifications");
  });

  it("returns account route for KYC types", () => {
    expect(getNotificationRoute("KYC_APPROVED")).toBe("/(tabs)/account");
    expect(getNotificationRoute("KYC_PENDING")).toBe("/(tabs)/account");
  });

  it("returns activity route for TRANSACTION types", () => {
    expect(getNotificationRoute("TRANSACTION_COMPLETED")).toBe("/(tabs)/activity");
    expect(getNotificationRoute("TRANSACTION_FAILED")).toBe("/(tabs)/activity");
  });

  it("returns tabs route for ACCOUNT_ACTIVATED", () => {
    expect(getNotificationRoute("ACCOUNT_ACTIVATED")).toBe("/(tabs)");
  });

  it("returns /notifications for unknown types", () => {
    expect(getNotificationRoute("UNKNOWN")).toBe("/notifications");
  });
});

describe("formatRelativeTime", () => {
  it('returns "Just now" for times less than 60 seconds ago', () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe("Just now");
  });

  it("returns minutes ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe("3h ago");
  });

  it("returns days ago for less than 7 days", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe("2d ago");
  });

  it("returns formatted date for 7+ days ago", () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date.toISOString());
    // Should be a locale date string, not a relative time
    expect(result).not.toContain("ago");
    expect(result).not.toBe("Just now");
  });
});
