import { useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import * as Clipboard from "expo-clipboard";
import { CLIPBOARD_CLEAR_MS } from "@/constants/limits";

/**
 * Hook that provides a secure copy function which:
 * - Clears clipboard when app goes to background
 * - Auto-clears clipboard after a timeout
 */
export function useClipboardClear() {
  const lastCopiedRef = useRef<string | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" && lastCopiedRef.current) {
        Clipboard.setStringAsync("");
        lastCopiedRef.current = null;
      }
    });
    return () => {
      sub.remove();
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  const copy = useCallback(async (value: string) => {
    await Clipboard.setStringAsync(value);
    lastCopiedRef.current = value;

    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }

    clearTimerRef.current = setTimeout(async () => {
      const current = await Clipboard.getStringAsync();
      if (current === value) {
        await Clipboard.setStringAsync("");
        lastCopiedRef.current = null;
      }
      clearTimerRef.current = null;
    }, CLIPBOARD_CLEAR_MS);
  }, []);

  return { copy };
}
