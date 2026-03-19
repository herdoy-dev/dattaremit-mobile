import { useEffect, useRef, useMemo } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import { ProfileForm } from "@/components/forms/profile-form";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { useAccountQuery } from "@/hooks/use-account-query";
import { getApiErrorMessage } from "@/lib/utils";
import { STORAGE_KEYS } from "@/constants/storage-keys";

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

  const initialValues = useMemo(() => {
    if (!existingUser) return undefined;
    return {
      firstName: existingUser.firstName ?? "",
      lastName: existingUser.lastName ?? "",
      dateOfBirth: existingUser.dateOfBirth
        ? new Date(existingUser.dateOfBirth).toISOString().split("T")[0]
        : "",
      phoneNumber:
        existingUser.phoneNumberPrefix && existingUser.phoneNumber
          ? `${existingUser.phoneNumberPrefix}${existingUser.phoneNumber}`
          : "",
      nationality: existingUser.nationality ?? "",
    };
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

  const handleSubmit = (values: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    nationality: string;
  }) => {
    if (existingUser) {
      updateMutation.mutate(values);
    } else {
      if (!clerkUser?.id || !clerkUser?.primaryEmailAddress?.emailAddress) return;
      profileMutation.mutate({
        ...values,
        clerkUserId: clerkUser.id,
        email: clerkUser.primaryEmailAddress.emailAddress,
        ...(referralCodeRef.current ? { referredByCode: referralCodeRef.current } : {}),
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <ProfileForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={activeMutation.isPending}
            submitError={
              activeMutation.isError
                ? getApiErrorMessage(
                    activeMutation.error,
                    "Failed to save profile. Please try again.",
                  )
                : null
            }
            submitLabel={existingUser ? "Update & Continue" : "Continue"}
            headerSlot={
              <View className="pb-4">
                <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                  Personal Information
                </Text>
                <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Tell us about yourself to get started
                </Text>
              </View>
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
