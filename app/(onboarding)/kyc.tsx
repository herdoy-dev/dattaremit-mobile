import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useMutation } from "@tanstack/react-query";
import { FileText } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { ImageUpload } from "@/components/ui/image-upload";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { validateRequired } from "@/lib/validation";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/store/theme-store";

const DOCUMENT_TYPES = [
  { label: "National ID Card", value: "national_id" },
  { label: "Passport", value: "passport" },
  { label: "Driver's License", value: "drivers_license" },
];

export default function KycScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const { primary } = useThemeColors();

  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentImage, setDocumentImage] = useState("");
  const [selfieImage, setSelfieImage] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const kycMutation = useMutation({
    mutationFn: onboardingService.submitKyc,
    onMutate: () => {
      progress.value = withTiming(90, { duration: 3000 });
    },
    onSuccess: async () => {
      progress.value = withTiming(100, { duration: 500 });
      await setStep("completed");
      router.replace("/(tabs)");
    },
    onError: () => {
      progress.value = withTiming(0, { duration: 300 });
    },
  });

  const validate = () => {
    const typeErr = validateRequired(documentType, "Document type");
    const numberErr = validateRequired(documentNumber, "Document number");
    const docImgErr = !documentImage ? "Document photo is required" : null;
    const selfieErr = !selfieImage ? "Selfie is required" : null;
    setErrors({
      documentType: typeErr,
      documentNumber: numberErr,
      documentImage: docImgErr,
      selfieImage: selfieErr,
    });
    return !typeErr && !numberErr && !docImgErr && !selfieErr;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    kycMutation.mutate({
      documentType,
      documentNumber,
      documentImage,
      selfieImage,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
          Identity Verification
        </Text>
        <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Verify your identity to complete registration
        </Text>
      </View>

      {/* Upload Progress */}
      {kycMutation.isPending && (
        <View className="mx-6 mt-2 overflow-hidden rounded-full bg-light-surface-dark dark:bg-dark-surface-light">
          <Animated.View
            style={progressStyle}
            className="h-1.5 rounded-full bg-primary"
          />
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          className="gap-5"
        >
          <CustomDropdown
            label="Document Type"
            options={DOCUMENT_TYPES}
            value={documentType}
            onChange={(v) => {
              setDocumentType(v);
              if (errors.documentType)
                setErrors((e) => ({ ...e, documentType: null }));
            }}
            placeholder="Select document type"
            error={errors.documentType}
          />

          <Input
            label="Document Number"
            value={documentNumber}
            onChangeText={(t) => {
              setDocumentNumber(t);
              if (errors.documentNumber)
                setErrors((e) => ({ ...e, documentNumber: null }));
            }}
            placeholder="Enter document number"
            autoCapitalize="characters"
            error={errors.documentNumber}
            icon={<FileText size={20} color="#9CA3AF" />}
          />

          <ImageUpload
            label="Document Photo"
            value={documentImage}
            onChange={(uri) => {
              setDocumentImage(uri);
              if (errors.documentImage)
                setErrors((e) => ({ ...e, documentImage: null }));
            }}
            error={errors.documentImage}
            variant="document"
          />

          <ImageUpload
            label="Selfie Verification"
            value={selfieImage}
            onChange={(uri) => {
              setSelfieImage(uri);
              if (errors.selfieImage)
                setErrors((e) => ({ ...e, selfieImage: null }));
            }}
            error={errors.selfieImage}
            variant="selfie"
          />

          {/* Info Box */}
          <View className="rounded-xl p-4" style={{ backgroundColor: hexToRgba(primary, 0.05) }}>
            <Text className="text-sm font-medium text-primary">
              Why we need this
            </Text>
            <Text className="mt-1 text-xs leading-5 text-light-text-secondary dark:text-dark-text-secondary">
              Identity verification helps us comply with financial regulations
              and protect your account from unauthorized access.
            </Text>
          </View>

          {kycMutation.isError && (
            <View className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
              <Text className="text-sm text-red-600 dark:text-red-400">
                Verification failed. Please check your documents and try again.
              </Text>
            </View>
          )}

          <Button
            title="Submit Verification"
            onPress={handleSubmit}
            loading={kycMutation.isPending}
            size="lg"
            className="mt-2"
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
