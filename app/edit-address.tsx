import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Building2, Hash } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { CountrySelector } from "@/components/ui/country-selector";
import { onboardingService } from "@/services/onboarding";
import { useForm } from "@/hooks/use-form";
import { useAccountQuery } from "@/hooks/use-account-query";
import { getApiErrorMessage } from "@/lib/utils";
import { validateRequired, validatePostalCode } from "@/lib/validation";
import { COLORS } from "@/constants/theme";

export default function EditAddressScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account } = useAccountQuery();
  const address = account?.data?.addresses?.[0];

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
    },
  );

  useEffect(() => {
    if (address) {
      setValue("country", address.country ?? "");
      setValue("city", address.city ?? "");
      setValue("street", address.addressLine1 ?? "");
      setValue("postalCode", address.postalCode ?? "");
      setValue("state", address.state ?? "");
    }
  }, [address]);

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof onboardingService.updateAddress>[1]) =>
      onboardingService.updateAddress(address!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      router.back();
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;
    updateMutation.mutate({
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
        <View className="flex-row items-center px-6 pt-4 pb-2">
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color={COLORS.placeholder} />
          </Pressable>
          <View>
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
              Edit Address
            </Text>
            <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Update your address information
            </Text>
          </View>
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

            {updateMutation.isError && (
              <ErrorBanner
                message={getApiErrorMessage(
                  updateMutation.error,
                  "Failed to update address. Please try again."
                )}
              />
            )}

            <Button
              title="Save Changes"
              onPress={handleSubmit}
              loading={updateMutation.isPending}
              size="lg"
              className="mt-2"
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
