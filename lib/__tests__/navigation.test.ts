import { typedReplace, typedPush } from "../navigation";

describe("typedReplace", () => {
  it("calls router.replace with the route", () => {
    const router = { replace: jest.fn(), push: jest.fn() } as any;
    typedReplace(router, "/(tabs)/home");
    expect(router.replace).toHaveBeenCalledWith("/(tabs)/home");
  });
});

describe("typedPush", () => {
  it("calls router.push with the route", () => {
    const router = { replace: jest.fn(), push: jest.fn() } as any;
    typedPush(router, "/(transfer)/send");
    expect(router.push).toHaveBeenCalledWith("/(transfer)/send");
  });
});
