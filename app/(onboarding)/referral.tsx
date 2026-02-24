import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gift } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { COLORS } from "@/constants/theme";

export default function ReferralScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a referral code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await onboardingService.validateReferralCode(trimmed);

      if (result?.valid) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, trimmed);
        await setStep("profile");
        router.replace("/(onboarding)/profile");
      } else {
        setError("Invalid referral code. Please check and try again.");
      }
    } catch {
      setError("Invalid referral code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await setStep("profile");
    router.replace("/(onboarding)/profile");
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
            Got a Referral Code?
          </Text>
          <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Enter the code or skip
          </Text>
        </View>

        <View className="flex-1 px-6 pt-4">
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            className="gap-5"
          >
            <Input
              label="Referral Code"
              value={code}
              onChangeText={(t) => {
                setCode(t.toUpperCase());
                setError(null);
              }}
              placeholder="Enter referral code"
              autoCapitalize="characters"
              icon={<Gift size={20} color={COLORS.placeholder} />}
            />

            {error && <ErrorBanner message={error} />}

            <Button
              title="Apply"
              onPress={handleApply}
              loading={loading}
              disabled={loading}
              size="lg"
            />

            <Button
              title="Skip"
              onPress={handleSkip}
              variant="outline"
              size="lg"
              disabled={loading}
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
