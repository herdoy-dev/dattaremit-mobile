import { View, Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Fingerprint, ScanFace } from "lucide-react-native";

import { useBiometric } from "@/hooks/use-biometric";
import { useThemeColors } from "@/hooks/use-theme-colors";

interface BiometricVerifyOverlayProps {
  visible: boolean;
}

export function BiometricVerifyOverlay({ visible }: BiometricVerifyOverlayProps) {
  const { label, iconType } = useBiometric();
  const { primary } = useThemeColors();
  const BiometricIcon = iconType === "face" ? ScanFace : Fingerprint;

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 z-50 items-center justify-center bg-light-bg dark:bg-dark-bg"
    >
      <View className="items-center px-8">
        <View
          className="mb-6 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: `${primary}15` }}
        >
          <BiometricIcon size={40} color={primary} />
        </View>

        <Text className="text-xl font-bold text-light-text dark:text-dark-text">
          Verifying Identity
        </Text>

        <Text className="mt-2 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Please authenticate with {label} to continue
        </Text>
      </View>
    </Animated.View>
  );
}
