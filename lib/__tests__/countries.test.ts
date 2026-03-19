import { getFlagEmoji, COUNTRIES } from "../countries";

describe("getFlagEmoji", () => {
  it("returns correct flag for US", () => {
    expect(getFlagEmoji("US")).toBe("\u{1F1FA}\u{1F1F8}");
  });

  it("returns correct flag for IN", () => {
    expect(getFlagEmoji("IN")).toBe("\u{1F1EE}\u{1F1F3}");
  });

  it("handles lowercase input", () => {
    expect(getFlagEmoji("us")).toBe("\u{1F1FA}\u{1F1F8}");
  });
});

describe("COUNTRIES", () => {
  it("contains US and India", () => {
    expect(COUNTRIES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "US", dial: "+1" }),
        expect.objectContaining({ code: "IN", dial: "+91" }),
      ]),
    );
  });

  it("each country has required fields", () => {
    for (const country of COUNTRIES) {
      expect(country).toHaveProperty("code");
      expect(country).toHaveProperty("name");
      expect(country).toHaveProperty("dial");
    }
  });
});
