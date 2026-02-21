import { useState } from "react";
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
import { useMutation } from "@tanstack/react-query";
import { User } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { CountrySelector } from "@/components/ui/country-selector";
import { PhoneInput } from "@/components/ui/phone-input";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import {
  validateRequired,
  validatePhone,
  validateDateOfBirth,
} from "@/lib/validation";

export default function ProfileScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const profileMutation = useMutation({
    mutationFn: onboardingService.submitProfile,
    onSuccess: async () => {
      await setStep("address");
      router.push("/(onboarding)/address");
    },
  });

  const validate = () => {
    const firstNameErr = validateRequired(firstName, "First name");
    const lastNameErr = validateRequired(lastName, "Last name");
    const dobErr = validateDateOfBirth(dateOfBirth);
    const phoneErr = validatePhone(phoneNumber);
    const nationalityErr = validateRequired(nationality, "Nationality");
    setErrors({
      firstName: firstNameErr,
      lastName: lastNameErr,
      dateOfBirth: dobErr,
      phoneNumber: phoneErr,
      nationality: nationalityErr,
    });
    return (
      !firstNameErr && !lastNameErr && !dobErr && !phoneErr && !nationalityErr
    );
  };

  const handleSubmit = () => {
    if (!validate()) return;
    profileMutation.mutate({
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      nationality,
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
                value={firstName}
                onChangeText={(t) => {
                  setFirstName(t);
                  if (errors.firstName)
                    setErrors((e) => ({ ...e, firstName: null }));
                }}
                placeholder="First name"
                autoCapitalize="words"
                error={errors.firstName}
                icon={<User size={20} color="#9CA3AF" />}
                className="flex-1"
              />

              <Input
                label="Last Name"
                value={lastName}
                onChangeText={(t) => {
                  setLastName(t);
                  if (errors.lastName)
                    setErrors((e) => ({ ...e, lastName: null }));
                }}
                placeholder="Last name"
                autoCapitalize="words"
                error={errors.lastName}
                icon={<User size={20} color="#9CA3AF" />}
                className="flex-1"
              />
            </View>

            <CustomDatePicker
              label="Date of Birth"
              value={dateOfBirth}
              onChange={(d) => {
                setDateOfBirth(d);
                if (errors.dateOfBirth)
                  setErrors((e) => ({ ...e, dateOfBirth: null }));
              }}
              error={errors.dateOfBirth}
            />

            <PhoneInput
              label="Phone Number"
              value={phoneNumber}
              onChangePhone={(t) => {
                setPhoneNumber(t);
                if (errors.phoneNumber)
                  setErrors((e) => ({ ...e, phoneNumber: null }));
              }}
              placeholder="Enter phone number"
              error={errors.phoneNumber}
            />

            <CountrySelector
              label="Nationality"
              value={nationality}
              onChange={(v) => {
                setNationality(v);
                if (errors.nationality)
                  setErrors((e) => ({ ...e, nationality: null }));
              }}
              placeholder="Select your nationality"
              error={errors.nationality}
            />

            {profileMutation.isError && (
              <View className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                <Text className="text-sm text-red-600 dark:text-red-400">
                  Failed to save profile. Please try again.
                </Text>
              </View>
            )}

            <Button
              title="Continue"
              onPress={handleSubmit}
              loading={profileMutation.isPending}
              size="lg"
              className="mt-2"
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
