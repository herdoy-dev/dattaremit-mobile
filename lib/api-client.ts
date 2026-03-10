import axios from "axios";
import { randomUUID } from "expo-crypto";
import { EventEmitter } from "events";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type TokenFn = () => Promise<string | null>;
let _getToken: TokenFn | null = null;

export const authEventEmitter = new EventEmitter();

export function setAuthToken(tokenFn: TokenFn) {
  _getToken = tokenFn;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const authToken = await _getToken();
      if (authToken) {
        config.headers["x-auth-token"] = authToken;
      } else {
        return Promise.reject(new Error("Authentication required"));
      }
    } catch (error) {
      return Promise.reject(new Error("Authentication failed"));
    }
  }

  // Only add idempotency keys for mutating requests
  if (config.method && ["post", "put", "patch", "delete"].includes(config.method)) {
    config.headers["Idempotency-Key"] =
      config.headers["Idempotency-Key"] ||
      config.data?._idempotencyKey ||
      randomUUID();
    if (config.data?._idempotencyKey) {
      delete config.data._idempotencyKey;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth failures
    if (error.response?.status === 401 || error.response?.status === 403) {
      authEventEmitter.emit("session-expired");
    }

    if (
      error.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
      error.code === "CERT_HAS_EXPIRED" ||
      error.code === "ERR_TLS_CERT_ALTNAME_INVALID"
    ) {
      if (__DEV__) {
        console.warn("SSL certificate validation failed");
      }
      throw new Error("Secure connection could not be established");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
