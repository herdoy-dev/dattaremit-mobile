import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import * as SecureStore from "expo-secure-store";
import { SECURE_KEYS } from "@/constants/storage-keys";

export type OnboardingStep =
  | "welcome"
  | "auth"
  | "referral"
  | "profile"
  | "address"
  | "kyc"
  | "completed";

const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "auth",
  "referral",
  "profile",
  "address",
  "kyc",
  "completed",
];

const STORAGE_KEY = SECURE_KEYS.ONBOARDING_STEP;

type Listener = () => void;

let currentStep: OnboardingStep = "welcome";
let isLoaded = false;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentStep;
}

async function loadStep() {
  try {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (stored && STEP_ORDER.includes(stored as OnboardingStep)) {
      currentStep = stored as OnboardingStep;
    }
  } catch {
    // SecureStore unavailable — continue with default step
  }
  isLoaded = true;
  emitChange();
}

async function setStep(step: OnboardingStep) {
  currentStep = step;
  emitChange();
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, step);
  } catch {
    // SecureStore write failed — in-memory state still updated
  }
}

async function advanceStep() {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex < STEP_ORDER.length - 1) {
    await setStep(STEP_ORDER[currentIndex + 1]);
  }
}

async function resetOnboarding() {
  await setStep("welcome");
}

export function useOnboardingStore() {
  const step = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [loaded, setLoaded] = useState(isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      loadStep().then(() => setLoaded(true));
    }
  }, []);

  const stepIndex = useMemo(() => STEP_ORDER.indexOf(step), [step]);

  const canAccess = useCallback(
    (targetStep: OnboardingStep) => {
      const targetIndex = STEP_ORDER.indexOf(targetStep);
      return stepIndex >= targetIndex;
    },
    [stepIndex],
  );

  return {
    step,
    stepIndex,
    isLoaded: loaded,
    canAccess,
    advanceStep,
    setStep,
    resetOnboarding,
  };
}

export { STEP_ORDER };
