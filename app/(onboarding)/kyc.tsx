import { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Mail } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { SuccessModal } from "@/components/ui/success-modal";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba, getApiErrorMessage } from "@/lib/utils";

export default function KycScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setStep } = useOnboardingStore();
  const { primary } = useThemeColors();

  const [showModal, setShowModal] = useState(false);

  const kycMutation = useMutation({
    mutationFn: onboardingService.requestKycLink,
    onSuccess: () => {
      setShowModal(true);
    },
  });

  const handleGotIt = async () => {
    await setStep("completed");
    await queryClient.invalidateQueries({ queryKey: ["account"] });
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <View className="flex-1 justify-center px-6">
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          className="items-center gap-6"
        >
          <IconCircle icon={<ShieldCheck size={48} color={primary} />} size="xl" color={primary} />

          <View className="items-center gap-2">
            <Text className="text-center text-lg font-semibold text-light-text dark:text-dark-text">
              Complete Your KYC
            </Text>
            <Text className="text-center text-sm leading-6 text-light-text-secondary dark:text-dark-text-secondary">
              To comply with financial regulations and keep your account secure, we need to verify
              your identity. Tap the button below and we&apos;ll send a verification link to your
              registered email.
            </Text>
          </View>

          {kycMutation.isError && (
            <View className="w-full rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
              <Text className="text-sm text-red-600 dark:text-red-400">
                {getApiErrorMessage(kycMutation.error, "Something went wrong. Please try again.")}
              </Text>
            </View>
          )}

          <Button
            title="Start KYC"
            onPress={() => kycMutation.mutate()}
            loading={kycMutation.isPending}
            size="lg"
            className="w-full"
          />
        </Animated.View>
      </View>

      <SuccessModal
        visible={showModal}
        onDismiss={handleGotIt}
        icon={<Mail size={36} color={primary} />}
        iconBackgroundColor={hexToRgba(primary, 0.1)}
        title="KYC Link Sent!"
        description="Please check your email and complete the KYC verification to get started."
      />
    </SafeAreaView>
  );
}
