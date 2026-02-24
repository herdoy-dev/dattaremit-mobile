import { useEffect, useState } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Mail } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/lib/utils";
import { buildThemeVars } from "@/store/theme-store";

export default function KycScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const { primary, surface, rawColors } = useThemeColors();
  const themeVars = buildThemeVars(rawColors);

  const [showModal, setShowModal] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const kycMutation = useMutation({
    mutationFn: onboardingService.requestKycLink,
    onSuccess: () => {
      setShowModal(true);
    },
  });

  useEffect(() => {
    if (showModal) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      cardOpacity.value = withTiming(1, { duration: 300 });
      iconScale.value = withDelay(
        200,
        withSpring(1, { damping: 12, stiffness: 150 }),
      );
      textOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
      buttonOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
    }
  }, [showModal]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleGotIt = async () => {
    await setStep("completed");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <View className="flex-1 justify-center px-6">
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          className="items-center gap-6"
        >
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: hexToRgba(primary, 0.1) }}
          >
            <ShieldCheck size={48} color={primary} />
          </View>

          <View className="items-center gap-2">
            <Text className="text-center text-lg font-semibold text-light-text dark:text-dark-text">
              Complete Your KYC
            </Text>
            <Text className="text-center text-sm leading-6 text-light-text-secondary dark:text-dark-text-secondary">
              To comply with financial regulations and keep your account secure,
              we need to verify your identity. Tap the button below and we'll
              send a verification link to your registered email.
            </Text>
          </View>

          {kycMutation.isError && (
            <View className="w-full rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
              <Text className="text-sm text-red-600 dark:text-red-400">
                Something went wrong. Please try again.
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

      {/* Success Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        statusBarTranslucent
        accessibilityViewIsModal={true}
      >
        <View
          style={[{ flex: 1 }, themeVars]}
          className="items-center justify-center"
        >
          <Animated.View
            style={backdropStyle}
            className="absolute inset-0 bg-black/50"
          />

          <Animated.View
            style={[cardStyle, { backgroundColor: surface }]}
            className="mx-8 rounded-3xl p-8"
          >
            <View className="items-center">
              <Animated.View
                style={[
                  iconStyle,
                  { backgroundColor: hexToRgba(primary, 0.1) },
                ]}
                className="mb-6 h-20 w-20 items-center justify-center rounded-full"
              >
                <Mail size={36} color={primary} />
              </Animated.View>

              <Animated.View style={textStyle} className="items-center">
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  KYC Link Sent!
                </Text>
                <Text className="mt-3 text-center text-sm leading-6 text-light-text-secondary dark:text-dark-text-secondary">
                  We've sent a verification link to your email. Please check
                  your inbox and complete your KYC verification.
                </Text>
              </Animated.View>

              <Animated.View style={buttonStyle} className="mt-8 w-full">
                <Pressable
                  onPress={handleGotIt}
                  className="h-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: primary }}
                  accessibilityRole="button"
                  accessibilityLabel="Got it, continue to app"
                >
                  <Text className="text-lg font-semibold text-white">
                    Got it
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
