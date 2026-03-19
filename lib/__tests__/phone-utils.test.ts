import { splitPhoneNumber } from "../phone-utils";

describe("splitPhoneNumber", () => {
  it("splits US phone number", () => {
    expect(splitPhoneNumber("+12345678901")).toEqual({
      prefix: "+1",
      number: "2345678901",
    });
  });

  it("splits Indian phone number", () => {
    expect(splitPhoneNumber("+919876543210")).toEqual({
      prefix: "+91",
      number: "9876543210",
    });
  });

  it("handles whitespace in input", () => {
    expect(splitPhoneNumber("  +1 234 567 8901  ")).toEqual({
      prefix: "+1",
      number: "2345678901",
    });
  });

  it("falls back to manual prefix extraction for unknown codes", () => {
    // The regex fallback matches +ddd as prefix
    expect(splitPhoneNumber("+441234567890")).toEqual({
      prefix: "+4412",
      number: "34567890",
    });
  });

  it("defaults to +1 prefix when no prefix detected", () => {
    expect(splitPhoneNumber("2345678901")).toEqual({
      prefix: "+1",
      number: "2345678901",
    });
  });
});
