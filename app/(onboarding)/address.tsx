import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Building2, Hash } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountrySelector } from "@/components/ui/country-selector";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { validateRequired, validatePostalCode } from "@/lib/validation";

export default function AddressScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [state, setState] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const addressMutation = useMutation({
    mutationFn: onboardingService.submitAddress,
    onSuccess: async () => {
      await setStep("kyc");
      router.push("/(onboarding)/kyc");
    },
  });

  const validate = () => {
    const countryErr = validateRequired(country, "Country");
    const cityErr = validateRequired(city, "City");
    const streetErr = validateRequired(street, "Street address");
    const postalErr = validatePostalCode(postalCode);
    const stateErr = validateRequired(state, "State/Province");
    setErrors({
      country: countryErr,
      city: cityErr,
      street: streetErr,
      postalCode: postalErr,
      state: stateErr,
    });
    return !countryErr && !cityErr && !streetErr && !postalErr && !stateErr;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addressMutation.mutate({ country, city, street, postalCode, state });
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
              value={country}
              onChange={(v) => {
                setCountry(v);
                if (errors.country) setErrors((e) => ({ ...e, country: null }));
              }}
              placeholder="Select your country"
              error={errors.country}
            />

            <Input
              label="State / Province"
              value={state}
              onChangeText={(t) => {
                setState(t);
                if (errors.state) setErrors((e) => ({ ...e, state: null }));
              }}
              placeholder="Enter state or province"
              autoCapitalize="words"
              error={errors.state}
              icon={<Building2 size={20} color="#9CA3AF" />}
            />

            <Input
              label="City"
              value={city}
              onChangeText={(t) => {
                setCity(t);
                if (errors.city) setErrors((e) => ({ ...e, city: null }));
              }}
              placeholder="Enter your city"
              autoCapitalize="words"
              error={errors.city}
              icon={<MapPin size={20} color="#9CA3AF" />}
            />

            <Input
              label="Street Address"
              value={street}
              onChangeText={(t) => {
                setStreet(t);
                if (errors.street) setErrors((e) => ({ ...e, street: null }));
              }}
              placeholder="Enter your street address"
              autoCapitalize="words"
              error={errors.street}
              icon={<MapPin size={20} color="#9CA3AF" />}
            />

            <Input
              label="Postal Code"
              value={postalCode}
              onChangeText={(t) => {
                setPostalCode(t);
                if (errors.postalCode) setErrors((e) => ({ ...e, postalCode: null }));
              }}
              placeholder="Enter postal code"
              keyboardType="number-pad"
              error={errors.postalCode}
              icon={<Hash size={20} color="#9CA3AF" />}
            />

            {addressMutation.isError && (
              <View className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                <Text className="text-sm text-red-600 dark:text-red-400">
                  Failed to save address. Please try again.
                </Text>
              </View>
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
