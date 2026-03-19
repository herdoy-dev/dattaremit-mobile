import { getKycLabel, getKycBadge, KYC_STATUS_LABELS, KYC_BADGE_STYLES } from "../kyc-utils";

describe("getKycLabel", () => {
  it("returns correct labels for known statuses", () => {
    expect(getKycLabel("ACTIVE")).toBe("Verified");
    expect(getKycLabel("PENDING")).toBe("Pending");
    expect(getKycLabel("INITIAL")).toBe("Not Started");
    expect(getKycLabel("REJECTED")).toBe("Rejected");
  });

  it("returns 'Unknown' for undefined or unrecognized status", () => {
    expect(getKycLabel(undefined)).toBe("Unknown");
    expect(getKycLabel("INVALID_STATUS")).toBe("Unknown");
  });
});

describe("getKycBadge", () => {
  it("returns correct badge styles for known statuses", () => {
    expect(getKycBadge("ACTIVE")).toBe(KYC_BADGE_STYLES.ACTIVE);
    expect(getKycBadge("PENDING")).toBe(KYC_BADGE_STYLES.PENDING);
    expect(getKycBadge("INITIAL")).toBe(KYC_BADGE_STYLES.INITIAL);
    expect(getKycBadge("REJECTED")).toBe(KYC_BADGE_STYLES.REJECTED);
  });

  it("returns INITIAL badge for undefined or unrecognized status", () => {
    expect(getKycBadge(undefined)).toBe(KYC_BADGE_STYLES.INITIAL);
    expect(getKycBadge("INVALID")).toBe(KYC_BADGE_STYLES.INITIAL);
  });

  it("badge objects have bg and text properties", () => {
    for (const status of Object.keys(KYC_STATUS_LABELS)) {
      const badge = getKycBadge(status);
      expect(badge).toHaveProperty("bg");
      expect(badge).toHaveProperty("text");
      expect(typeof badge.bg).toBe("string");
      expect(typeof badge.text).toBe("string");
    }
  });
});
