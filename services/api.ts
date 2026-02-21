import axios from "axios";

const API_BASE_URL = "https://api.dattaremit.com/v1";

type TokenFn = () => Promise<string | null>;
let _getToken: TokenFn | null = null;

export function setAuthToken(tokenFn: TokenFn) {
  _getToken = tokenFn;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    const token = await _getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
