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
import { ArrowLeft, User } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { CountrySelector } from "@/components/ui/country-selector";
import { PhoneInput } from "@/components/ui/phone-input";
import { onboardingService } from "@/services/onboarding";
import { useForm } from "@/hooks/use-form";
import { useAccountQuery } from "@/hooks/use-account-query";
import { getApiErrorMessage } from "@/lib/utils";
import {
  validateRequired,
  validatePhone,
  validateDateOfBirth,
} from "@/lib/validation";
import { COLORS } from "@/constants/theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account } = useAccountQuery();
  const user = account?.data?.user;

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
    if (user) {
      setValue("firstName", user.firstName ?? "");
      setValue("lastName", user.lastName ?? "");
      if (user.dateOfBirth) {
        setValue("dateOfBirth", new Date(user.dateOfBirth).toISOString().split("T")[0]);
      }
      if (user.phoneNumberPrefix && user.phoneNumber) {
        setValue("phoneNumber", `${user.phoneNumberPrefix}${user.phoneNumber}`);
      }
      setValue("nationality", user.nationality ?? "");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: onboardingService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      router.back();
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;
    updateMutation.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth,
      phoneNumber: values.phoneNumber,
      nationality: values.nationality,
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
              Edit Profile
            </Text>
            <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Update your personal information
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

            <PhoneInput
              label="Phone Number"
              value={values.phoneNumber}
              onChangePhone={(t) => setValue("phoneNumber", t)}
              placeholder="Enter phone number"
              error={errors.phoneNumber}
            />

            <CountrySelector
              label="Nationality"
              value={values.nationality}
              onChange={(v) => setValue("nationality", v)}
              placeholder="Select your nationality"
              error={errors.nationality}
            />

            {updateMutation.isError && (
              <ErrorBanner
                message={getApiErrorMessage(
                  updateMutation.error,
                  "Failed to update profile. Please try again."
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
