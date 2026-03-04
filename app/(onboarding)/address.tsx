import { useEffect } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Building2, Hash } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { CountrySelector } from "@/components/ui/country-selector";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { useForm } from "@/hooks/use-form";
import { useAccountQuery } from "@/hooks/use-account-query";
import { getApiErrorMessage } from "@/lib/utils";
import { validateRequired, validatePostalCode } from "@/lib/validation";
import { COLORS } from "@/constants/theme";

export default function AddressScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  const { data: accountData } = useAccountQuery();
  const existingAddress = accountData?.data?.addresses?.[0];

  const { values, errors, setValue, validate } = useForm(
    {
      country: "",
      city: "",
      street: "",
      postalCode: "",
      state: "",
    },
    {
      country: (v) => validateRequired(v, "Country"),
      city: (v) => validateRequired(v, "City"),
      street: (v) => validateRequired(v, "Street address"),
      postalCode: (v) => validatePostalCode(v),
      state: (v) => validateRequired(v, "State/Province"),
    }
  );

  useEffect(() => {
    if (existingAddress) {
      setValue("country", existingAddress.country);
      setValue("city", existingAddress.city);
      setValue("street", existingAddress.addressLine1);
      setValue("postalCode", existingAddress.postalCode);
      setValue("state", existingAddress.state);
    }
  }, [existingAddress]);

  const addressMutation = useMutation({
    mutationFn: onboardingService.submitAddress,
    onSuccess: async () => {
      await setStep("kyc");
      router.push("/(onboarding)/kyc");
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;
    addressMutation.mutate({
      country: values.country,
      city: values.city,
      street: values.street,
      postalCode: values.postalCode,
      state: values.state,
    });
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
            Address Information
          </Text>
          <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Where are you located?
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            className="gap-5"
          >
            <CountrySelector
              label="Country"
              value={values.country}
              onChange={(v) => setValue("country", v)}
              placeholder="Select your country"
              error={errors.country}
            />

            <Input
              label="State / Province"
              value={values.state}
              onChangeText={(t) => setValue("state", t)}
              placeholder="Enter state or province"
              autoCapitalize="words"
              error={errors.state}
              icon={<Building2 size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="City"
              value={values.city}
              onChangeText={(t) => setValue("city", t)}
              placeholder="Enter your city"
              autoCapitalize="words"
              error={errors.city}
              icon={<MapPin size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="Street Address"
              value={values.street}
              onChangeText={(t) => setValue("street", t)}
              placeholder="Enter your street address"
              autoCapitalize="words"
              error={errors.street}
              icon={<MapPin size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="Postal Code"
              value={values.postalCode}
              onChangeText={(t) => setValue("postalCode", t)}
              placeholder="Enter postal code"
              keyboardType="number-pad"
              error={errors.postalCode}
              icon={<Hash size={20} color={COLORS.placeholder} />}
            />

            {addressMutation.isError && (
              <ErrorBanner
                message={getApiErrorMessage(
                  addressMutation.error,
                  "Failed to save address. Please try again."
                )}
              />
            )}

            <Button
              title="Continue"
              onPress={handleSubmit}
              loading={addressMutation.isPending}
              size="lg"
              className="mt-2"
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
