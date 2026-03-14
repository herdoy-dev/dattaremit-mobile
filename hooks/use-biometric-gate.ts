import { useCallback, useRef, useState } from "react";
import { useBiometric } from "./use-biometric";

interface UseBiometricGateOptions {
  promptMessage: string;
  maxAttempts?: number;
}

export function useBiometricGate({
  promptMessage,
  maxAttempts = 3,
}: UseBiometricGateOptions) {
  const { isEnabled, verify } = useBiometric();
  const attemptsRef = useRef(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const gate = useCallback(
    async (action: () => void | Promise<void>): Promise<boolean> => {
      if (!isEnabled) {
        await action();
        return true;
      }

      if (isBlocked) return false;

      const success = await verify(promptMessage);

      if (success) {
        attemptsRef.current = 0;
        await action();
        return true;
      }

      attemptsRef.current += 1;
      if (attemptsRef.current >= maxAttempts) {
        setIsBlocked(true);
      }
      return false;
    },
    [isEnabled, isBlocked, verify, promptMessage, maxAttempts]
  );

  const resetGate = useCallback(() => {
    attemptsRef.current = 0;
    setIsBlocked(false);
  }, []);

  return { gate, isBlocked, resetGate };
}
