import { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import { User } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { CountrySelector } from "@/components/ui/country-selector";
import { PhoneInput } from "@/components/ui/phone-input";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { useForm } from "@/hooks/use-form";
import { useAccountQuery } from "@/hooks/use-account-query";
import { getApiErrorMessage } from "@/lib/utils";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import {
  validateRequired,
  validatePhone,
  validateDateOfBirth,
} from "@/lib/validation";
import { COLORS } from "@/constants/theme";
import { COUNTRIES } from "@/lib/countries";

export default function ProfileScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const { user: clerkUser } = useUser();
  const referralCodeRef = useRef<string | null>(null);

  const queryClient = useQueryClient();
  const { data: accountData } = useAccountQuery();
  const existingUser = accountData?.data?.user;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.REFERRAL_CODE).then((code) => {
      referralCodeRef.current = code;
    });
  }, []);

  const { values, errors, setValue, validate } = useForm(
    {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phoneNumber: "",
      nationality: "",
    },
    {
      firstName: (v) => validateRequired(v, "First name"),
      lastName: (v) => validateRequired(v, "Last name"),
      dateOfBirth: (v) => validateDateOfBirth(v),
      phoneNumber: (v) => validatePhone(v),
      nationality: (v) => validateRequired(v, "Nationality"),
    },
  );

  useEffect(() => {
    if (existingUser) {
      setValue("firstName", existingUser.firstName ?? "");
      setValue("lastName", existingUser.lastName ?? "");
      if (existingUser.dateOfBirth) {
        setValue("dateOfBirth", new Date(existingUser.dateOfBirth).toISOString().split("T")[0]);
      }
      if (existingUser.phoneNumberPrefix && existingUser.phoneNumber) {
        setValue("phoneNumber", `${existingUser.phoneNumberPrefix}${existingUser.phoneNumber}`);
      }
      setValue("nationality", existingUser.nationality ?? "");
    }
  }, [existingUser]);

  const profileMutation = useMutation({
    mutationFn: onboardingService.submitProfile,
    onSuccess: async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.REFERRAL_CODE);
      await setStep("address");
      router.push("/(onboarding)/address");
    },
  });

  const updateMutation = useMutation({
    mutationFn: onboardingService.updateProfile,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      await setStep("address");
      router.push("/(onboarding)/address");
    },
  });

  const activeMutation = existingUser ? updateMutation : profileMutation;

  const handleSubmit = () => {
    if (!validate()) return;

    if (existingUser) {
      updateMutation.mutate({
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth,
        phoneNumber: values.phoneNumber,
        nationality: values.nationality,
      });
    } else {
      if (!clerkUser?.id || !clerkUser?.primaryEmailAddress?.emailAddress) return;

      profileMutation.mutate({
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth,
        phoneNumber: values.phoneNumber,
        nationality: values.nationality,
        clerkUserId: clerkUser.id,
        email: clerkUser.primaryEmailAddress.emailAddress,
        ...(referralCodeRef.current
          ? { referredByCode: referralCodeRef.current }
          : {}),
      });
    }
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
            Personal Information
          </Text>
          <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Tell us about yourself to get started
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
            <View className="flex-row gap-3">
              <Input
                label="First Name"
                value={values.firstName}
                onChangeText={(t) => setValue("firstName", t)}
                placeholder="First name"
                autoCapitalize="words"
                error={errors.firstName}
                icon={<User size={20} color={COLORS.placeholder} />}
                className="flex-1"
              />

              <Input
                label="Last Name"
                value={values.lastName}
                onChangeText={(t) => setValue("lastName", t)}
                placeholder="Last name"
                autoCapitalize="words"
                error={errors.lastName}
                icon={<User size={20} color={COLORS.placeholder} />}
                className="flex-1"
              />
            </View>

            <CustomDatePicker
              label="Date of Birth"
              value={values.dateOfBirth}
              onChange={(d) => setValue("dateOfBirth", d)}
              error={errors.dateOfBirth}
            />

            <CountrySelector
              label="Nationality"
              value={values.nationality}
              onChange={(v) => {
                setValue("nationality", v);
                const country = COUNTRIES.find((c) => c.code === v);
                if (country) {
                  setValue("phoneNumber", country.dial);
                }
              }}
              placeholder="Select your nationality"
              error={errors.nationality}
            />

            <PhoneInput
              label="Phone Number"
              value={values.phoneNumber}
              onChangePhone={(t) => setValue("phoneNumber", t)}
              placeholder="Enter phone number"
              error={errors.phoneNumber}
            />

            {activeMutation.isError && (
              <ErrorBanner
                message={getApiErrorMessage(
                  activeMutation.error,
                  "Failed to save profile. Please try again."
                )}
              />
            )}

            <Button
              title={existingUser ? "Update & Continue" : "Continue"}
              onPress={handleSubmit}
              loading={activeMutation.isPending}
              size="lg"
              className="mt-2"
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
