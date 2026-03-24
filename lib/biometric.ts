import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { SECURE_KEYS } from "@/constants/storage-keys";

export type HardwareStatus = {
  hasHardware: boolean;
  isEnrolled: boolean;
  authenticationType: LocalAuthentication.AuthenticationType[];
};

export async function getHardwareStatus(): Promise<HardwareStatus> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const authenticationType = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return { hasHardware, isEnrolled, authenticationType };
}

export async function authenticate(
  promptMessage: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    disableDeviceFallback: Platform.OS === "ios",
    cancelLabel: "Cancel",
  });
  return {
    success: result.success,
    error: result.success ? undefined : result.error,
  };
}

function enabledKey(userId: string) {
  return `${SECURE_KEYS.BIOMETRIC_ENABLED}_${userId}`;
}

function promptedKey(userId: string) {
  return `${SECURE_KEYS.BIOMETRIC_PROMPT_SHOWN}_${userId}`;
}

export async function getEnrollmentState(userId: string): Promise<boolean> {
  const value = await SecureStore.getItemAsync(enabledKey(userId));
  return value === "true";
}

export async function setEnrollmentState(userId: string, enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(enabledKey(userId), enabled ? "true" : "false");
  if (enabled) {
    await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_USER_ID, userId);
  }
}

export async function hasBeenPrompted(userId: string): Promise<boolean> {
  const value = await SecureStore.getItemAsync(promptedKey(userId));
  return value === "true";
}

export async function markPrompted(userId: string): Promise<void> {
  await SecureStore.setItemAsync(promptedKey(userId), "true");
}

export async function clearEnrollment(): Promise<void> {
  const userId = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_USER_ID);
  if (userId) {
    await SecureStore.deleteItemAsync(enabledKey(userId));
    await SecureStore.deleteItemAsync(promptedKey(userId));
  }
  await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_USER_ID);
}

export function getBiometricLabel(types: LocalAuthentication.AuthenticationType[]): string {
  if (Platform.OS === "ios") {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Touch ID";
    }
  }
  return "Biometrics";
}

export function getBiometricIconType(
  types: LocalAuthentication.AuthenticationType[],
): "face" | "fingerprint" {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return "face";
  }
  return "fingerprint";
}
