import { useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import { lock } from "@/store/biometric-lock-store";
import { usePathname } from "expo-router";

const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export function useInactivityTimer() {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const pathname = usePathname();

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => lock(), INACTIVITY_TIMEOUT_MS);
  }, []);

  // Reset on navigation
  useEffect(() => {
    resetTimer();
  }, [pathname]);

  // Reset on app returning to active
  useEffect(() => {
    resetTimer();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") resetTimer();
    });

    return () => {
      clearTimeout(timerRef.current);
      sub.remove();
    };
  }, []);

  return { onTouchStart: resetTimer };
}
