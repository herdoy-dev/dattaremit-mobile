import { useEffect, useRef, useCallback } from "react";
import { View, Text, AppState, type AppStateStatus } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Fingerprint, ScanFace } from "lucide-react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useBiometricLockStore, lock } from "@/store/biometric-lock-store";
import { useBiometric } from "@/hooks/use-biometric";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { COLORS } from "@/constants/theme";

const MAX_ATTEMPTS = 3;

export function BiometricLockOverlay() {
  const { isLocked, unlock } = useBiometricLockStore();
  const { isEnabled, isLoaded, verify, label, iconType, clearEnrollment } =
    useBiometric();
  const BiometricIcon = iconType === "face" ? ScanFace : Fingerprint;
  const { signOut } = useAuth();
  const { resetOnboarding } = useOnboardingStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { primary } = useThemeColors();

  const attemptsRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);

  // Listen to AppState changes to lock when returning from background
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/active/) &&
          nextState === "background"
        ) {
          // Going to background — will lock on return
        }
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === "active" &&
          isEnabled &&
          isLoaded
        ) {
          lock();
        }
        appStateRef.current = nextState;
      }
    );
    return () => subscription.remove();
  }, [isEnabled, isLoaded]);

  const handleUnlock = useCallback(async () => {
    const success = await verify(`Unlock with ${label}`);
    if (success) {
      attemptsRef.current = 0;
      unlock();
    } else {
      attemptsRef.current += 1;
    }
  }, [verify, label, unlock]);

  const handleSignOut = useCallback(async () => {
    await clearEnrollment();
    await signOut();
    await resetOnboarding();
    queryClient.clear();
    unlock();
    router.replace("/(auth)/welcome");
  }, [clearEnrollment, signOut, resetOnboarding, queryClient, unlock, router]);

  // Auto-trigger biometric on mount when locked
  useEffect(() => {
    if (isLocked && isLoaded && isEnabled) {
      handleUnlock();
    }
  }, [isLocked, isLoaded, isEnabled]);

  if (!isLocked) return null;

  const showFallback = attemptsRef.current >= MAX_ATTEMPTS;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 z-50 items-center justify-center bg-light-bg dark:bg-dark-bg"
    >
      <View className="items-center px-8">
        <View
          className="mb-8 h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: `${primary}15` }}
        >
          <BiometricIcon size={48} color={primary} />
        </View>

        <Text className="mb-2 text-2xl font-bold text-light-text dark:text-dark-text">
          Welcome Back
        </Text>

        <Text className="mb-8 text-center text-base text-light-text-secondary dark:text-dark-text-secondary">
          Verify your identity to continue
        </Text>

        {!showFallback ? (
          <Button
            title={`Unlock with ${label}`}
            onPress={handleUnlock}
            size="lg"
            className="w-full"
          />
        ) : (
          <View className="w-full gap-3">
            <Text className="mb-2 text-center text-sm text-red-500">
              Too many failed attempts.
            </Text>
            <Button
              title="Try Again"
              onPress={() => {
                attemptsRef.current = 0;
                handleUnlock();
              }}
              variant="outline"
              size="lg"
              className="w-full"
            />
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="danger"
              size="lg"
              className="w-full"
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
}
