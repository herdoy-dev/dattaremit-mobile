import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";
import {
  getHardwareStatus,
  getEnrollmentState,
  setEnrollmentState,
  authenticate,
  hasBeenPrompted as checkPrompted,
  markPrompted as savePrompted,
  clearEnrollment,
  getBiometricLabel,
  type HardwareStatus,
} from "@/lib/biometric";

export function useBiometric() {
  const { userId } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>({
    hasHardware: false,
    isEnrolled: false,
    authenticationType: [],
  });

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function load() {
      const hw = await getHardwareStatus();
      const enabled = await getEnrollmentState(userId!);

      // If biometrics were removed from device, auto-disable
      const effectiveEnabled = enabled && hw.isEnrolled;
      if (enabled && !hw.isEnrolled) {
        await setEnrollmentState(userId!, false);
      }

      if (!cancelled) {
        setHardwareStatus(hw);
        setIsEnabled(effectiveEnabled);
        setIsLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    const result = await authenticate(
      `Enable ${getBiometricLabel(hardwareStatus.authenticationType)}`
    );
    if (result.success) {
      await setEnrollmentState(userId, true);
      setIsEnabled(true);
      return true;
    }
    return false;
  }, [userId, hardwareStatus.authenticationType]);

  const disable = useCallback(async () => {
    if (!userId) return;
    await setEnrollmentState(userId, false);
    setIsEnabled(false);
  }, [userId]);

  const verify = useCallback(
    async (promptMessage: string): Promise<boolean> => {
      const result = await authenticate(promptMessage);
      return result.success;
    },
    []
  );

  const hasBeenPrompted = useCallback(async (): Promise<boolean> => {
    if (!userId) return true;
    return checkPrompted(userId);
  }, [userId]);

  const markPrompted = useCallback(async () => {
    if (!userId) return;
    await savePrompted(userId);
  }, [userId]);

  const label = getBiometricLabel(hardwareStatus.authenticationType);

  return {
    isLoaded,
    isEnabled,
    hardwareStatus,
    label,
    enable,
    disable,
    verify,
    hasBeenPrompted,
    markPrompted,
    clearEnrollment,
  };
}
