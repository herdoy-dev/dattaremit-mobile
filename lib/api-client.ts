import axios from "axios";
import { randomUUID } from "expo-crypto";
import { getClerkInstance } from "@clerk/clerk-expo";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;


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
    const clerk = getClerkInstance();
    const authToken = await clerk.session?.getToken();
    const idempotencyKey = randomUUID();
    if (idempotencyKey) {
      config.headers["idempotency-Key"] = idempotencyKey;
    }
    if (authToken) {
      config.headers["x-auth-token"] = authToken;
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