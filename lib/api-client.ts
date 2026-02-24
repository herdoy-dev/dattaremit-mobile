import axios from "axios";
import { randomUUID } from "expo-crypto";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type TokenFn = () => Promise<string | null>;
let _getToken: TokenFn | null = null;

export function setAuthToken(tokenFn: TokenFn) {
  _getToken = tokenFn;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    if (_getToken) {
      const authToken = await _getToken();
      if (authToken) {
        config.headers["x-auth-token"] = authToken;
      }
    }

    // Only add idempotency keys for mutating requests
    if (config.method && ["post", "put", "patch", "delete"].includes(config.method)) {
      config.headers["idempotency-Key"] = randomUUID();
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[API] Token error:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
      error.code === "CERT_HAS_EXPIRED" ||
      error.code === "ERR_TLS_CERT_ALTNAME_INVALID"
    ) {
      console.warn("SSL certificate validation failed");
      throw new Error("Secure connection could not be established");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
