// Define __DEV__ for test environment
import * as Sentry from "@sentry/react-native";
import { getTraceData } from "@sentry/core";
import apiClient, { setAuthToken, authEventEmitter } from "../api-client";

(globalThis as any).__DEV__ = true;

// Mock expo virtual env (injected by babel-preset-expo)
jest.mock("expo/virtual/env", () => ({
  env: process.env,
}));

// Mock dependencies before importing the module
jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "test-uuid-1234"),
}));

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
}));

jest.mock("@sentry/core", () => ({
  getTraceData: jest.fn(() => ({})),
}));

const mockGetTraceData = getTraceData as jest.Mock;
const mockSentry = Sentry as jest.Mocked<typeof Sentry>;

beforeEach(() => {
  jest.clearAllMocks();
});

// Access interceptor handlers
const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];
const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];

describe("api-client", () => {
  describe("setAuthToken", () => {
    it("stores the token function for request interceptor", () => {
      const tokenFn = jest.fn().mockResolvedValue("token123");
      setAuthToken(tokenFn);
      expect(tokenFn).not.toHaveBeenCalled();
    });
  });

  describe("request interceptor", () => {
    it("adds auth token header when token function is set", async () => {
      const tokenFn = jest.fn().mockResolvedValue("my-token");
      setAuthToken(tokenFn);

      const config = {
        headers: {} as Record<string, string>,
        method: "get",
      };

      const result = await requestInterceptor.fulfilled(config);
      expect(result.headers["x-auth-token"]).toBe("my-token");
    });

    it("rejects when token function returns null", async () => {
      const tokenFn = jest.fn().mockResolvedValue(null);
      setAuthToken(tokenFn);

      const config = {
        headers: {} as Record<string, string>,
        method: "get",
      };

      await expect(requestInterceptor.fulfilled(config)).rejects.toThrow("Authentication required");
    });

    it("rejects when token function throws", async () => {
      const tokenFn = jest.fn().mockRejectedValue(new Error("Token error"));
      setAuthToken(tokenFn);

      const config = {
        headers: {} as Record<string, string>,
        method: "get",
      };

      await expect(requestInterceptor.fulfilled(config)).rejects.toThrow("Authentication failed");
    });

    it("adds sentry trace headers when available", async () => {
      mockGetTraceData.mockReturnValue({
        "sentry-trace": "trace-id",
        baggage: "baggage-value",
      });

      // Clear token fn to skip auth
      setAuthToken(null as any);

      const config = {
        headers: {} as Record<string, string>,
        method: "get",
      };

      const result = await requestInterceptor.fulfilled(config);
      expect(result.headers["sentry-trace"]).toBe("trace-id");
      expect(result.headers["baggage"]).toBe("baggage-value");
    });

    it("adds idempotency key for mutating requests", async () => {
      setAuthToken(null as any);

      const config = {
        headers: {} as Record<string, string>,
        method: "post",
        data: {},
      };

      const result = await requestInterceptor.fulfilled(config);
      expect(result.headers["Idempotency-Key"]).toBe("test-uuid-1234");
    });

    it("uses existing idempotency key from headers", async () => {
      setAuthToken(null as any);

      const config = {
        headers: { "Idempotency-Key": "existing-key" } as Record<string, string>,
        method: "post",
        data: {},
      };

      const result = await requestInterceptor.fulfilled(config);
      expect(result.headers["Idempotency-Key"]).toBe("existing-key");
    });

    it("uses _idempotencyKey from data and removes it", async () => {
      setAuthToken(null as any);

      const config = {
        headers: {} as Record<string, string>,
        method: "put",
        data: { _idempotencyKey: "data-key", field: "value" },
      };

      const result = await requestInterceptor.fulfilled(config);
      expect(result.headers["Idempotency-Key"]).toBe("data-key");
      expect(result.data._idempotencyKey).toBeUndefined();
    });

    it("does not add idempotency key for GET requests", async () => {
      setAuthToken(null as any);

      const config = {
        headers: {} as Record<string, string>,
        method: "get",
      };

      const result = await requestInterceptor.fulfilled(config);
      expect(result.headers["Idempotency-Key"]).toBeUndefined();
    });
  });

  describe("response interceptor", () => {
    it("passes through successful responses", () => {
      const response = { status: 200, data: { ok: true } };
      expect(responseInterceptor.fulfilled(response)).toBe(response);
    });

    it("adds sentry breadcrumb on error", async () => {
      const error = {
        config: { method: "get", url: "/api/test" },
        response: { status: 500 },
      };

      await expect(responseInterceptor.rejected(error)).rejects.toBe(error);
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "api",
          level: "error",
        }),
      );
    });

    it("emits session-expired on 401", async () => {
      const listener = jest.fn();
      authEventEmitter.on("session-expired", listener);

      const error = {
        config: { method: "get", url: "/test" },
        response: { status: 401 },
      };

      await expect(responseInterceptor.rejected(error)).rejects.toBe(error);
      expect(listener).toHaveBeenCalled();

      authEventEmitter.off("session-expired", listener);
    });

    it("emits session-expired on 403", async () => {
      const listener = jest.fn();
      authEventEmitter.on("session-expired", listener);

      const error = {
        config: { method: "get", url: "/test" },
        response: { status: 403 },
      };

      await expect(responseInterceptor.rejected(error)).rejects.toBe(error);
      expect(listener).toHaveBeenCalled();

      authEventEmitter.off("session-expired", listener);
    });

    it("throws SSL error for UNABLE_TO_VERIFY_LEAF_SIGNATURE", async () => {
      const error = {
        code: "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
        config: { method: "get", url: "/test" },
      };
      await expect(async () => responseInterceptor.rejected(error)).rejects.toThrow(
        "Secure connection could not be established",
      );
    });

    it("throws SSL error for CERT_HAS_EXPIRED", async () => {
      const error = { code: "CERT_HAS_EXPIRED", config: { method: "get", url: "/test" } };
      await expect(async () => responseInterceptor.rejected(error)).rejects.toThrow(
        "Secure connection could not be established",
      );
    });

    it("throws SSL error for ERR_TLS_CERT_ALTNAME_INVALID", async () => {
      const error = {
        code: "ERR_TLS_CERT_ALTNAME_INVALID",
        config: { method: "get", url: "/test" },
      };
      await expect(async () => responseInterceptor.rejected(error)).rejects.toThrow(
        "Secure connection could not be established",
      );
    });

    it("handles network error without response", async () => {
      const error = {
        config: { method: "get", url: "/test" },
      };

      await expect(responseInterceptor.rejected(error)).rejects.toBe(error);
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("network error"),
        }),
      );
    });
  });
});
