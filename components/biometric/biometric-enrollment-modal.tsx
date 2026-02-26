import { View, Text } from "react-native";
import { Fingerprint } from "lucide-react-native";

import { CustomModal } from "@/components/ui/custom-modal";
import { Button } from "@/components/ui/button";
import { useBiometric } from "@/hooks/use-biometric";
import { useThemeColors } from "@/hooks/use-theme-colors";

interface BiometricEnrollmentModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BiometricEnrollmentModal({
  visible,
  onClose,
}: BiometricEnrollmentModalProps) {
  const { enable, markPrompted, label } = useBiometric();
  const { primary } = useThemeColors();

  const handleEnable = async () => {
    const success = await enable();
    await markPrompted();
    if (success) onClose();
  };

  const handleSkip = async () => {
    await markPrompted();
    onClose();
  };

  return (
    <CustomModal visible={visible} onClose={handleSkip} snapPoint={0.45}>
      <View className="items-center gap-4">
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: `${primary}15` }}
        >
          <Fingerprint size={40} color={primary} />
        </View>

        <Text className="text-xl font-bold text-light-text dark:text-dark-text">
          Enable {label}?
        </Text>

        <Text className="text-center text-sm leading-5 text-light-text-secondary dark:text-dark-text-secondary px-2">
          Use {label} to quickly unlock the app and verify transactions. You can
          change this anytime in Settings.
        </Text>

        <View className="mt-2 w-full gap-3">
          <Button title={`Enable ${label}`} onPress={handleEnable} size="lg" />
          <Button
            title="Not Now"
            onPress={handleSkip}
            variant="ghost"
            size="lg"
          />
        </View>
      </View>
    </CustomModal>
  );
}
