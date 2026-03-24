import { useEffect, useRef, useCallback } from "react";
import { Platform, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { registerDevice, unregisterDevice as unregisterDeviceApi } from "@/services/notifications";

const MAX_RETRIES = 3;

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getExpoPushToken(): Promise<string | null> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    Sentry.captureMessage("Missing EAS projectId for push notifications", "warning");
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

async function registerWithRetry(token: string, deviceName: string | null): Promise<string | null> {
  const platform = Platform.OS === "ios" ? "IOS" : "ANDROID";
  const payload = {
    expoPushToken: token,
    platform: platform as "IOS" | "ANDROID",
    ...(deviceName ? { deviceName } : {}),
  };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const device = await registerDevice(payload);
      return device.id;
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        Sentry.captureException(error, {
          tags: { source: "push-notifications", action: "register" },
        });
        return null;
      }
      await delay(1000 * Math.pow(2, attempt));
    }
  }
  return null;
}

export function usePushNotifications(isSignedIn: boolean) {
  const registeredRef = useRef(false);

  const register = useCallback(async () => {
    if (!Device.isDevice) return;
    if (registeredRef.current) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const alreadyAsked = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PERMISSION_ASKED);
      if (alreadyAsked === "true") return;

      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PERMISSION_ASKED, "true");
    }

    if (finalStatus !== "granted") return;

    const token = await getExpoPushToken();
    if (!token) return;

    // Check if token changed since last registration
    const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
    if (storedToken === token) {
      registeredRef.current = true;
      return;
    }

    // Unregister old device if token changed
    if (storedToken) {
      const oldDeviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (oldDeviceId) {
        try {
          await unregisterDeviceApi(oldDeviceId);
        } catch {
          // Old device may already be cleaned up
        }
      }
    }

    const deviceId = await registerWithRetry(token, Device.deviceName);
    if (deviceId) {
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      registeredRef.current = true;
    }
  }, []);

  const unregisterDevice = useCallback(async () => {
    const deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (deviceId) {
      try {
        await unregisterDeviceApi(deviceId);
      } catch {
        // Best-effort cleanup
      }
    }
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PUSH_TOKEN,
      STORAGE_KEYS.DEVICE_ID,
      STORAGE_KEYS.NOTIFICATION_PERMISSION_ASKED,
    ]);
    registeredRef.current = false;
  }, []);

  // Register on mount when signed in
  useEffect(() => {
    if (isSignedIn) {
      register();
    }
  }, [isSignedIn, register]);

  // Re-check token on app foreground
  useEffect(() => {
    if (!isSignedIn) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        registeredRef.current = false;
        register();
      }
    });
    return () => sub.remove();
  }, [isSignedIn, register]);

  return { unregisterDevice };
}
