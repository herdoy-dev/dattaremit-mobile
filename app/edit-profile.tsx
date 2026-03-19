import { useMemo } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";
import { ProfileForm } from "@/components/forms/profile-form";
import { onboardingService } from "@/services/onboarding";
import { useAccountQuery } from "@/hooks/use-account-query";
import { getApiErrorMessage } from "@/lib/utils";
import { COLORS } from "@/constants/theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account } = useAccountQuery();
  const user = account?.data?.user;

  const initialValues = useMemo(() => {
    if (!user) return undefined;
    return {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
      phoneNumber:
        user.phoneNumberPrefix && user.phoneNumber
          ? `${user.phoneNumberPrefix}${user.phoneNumber}`
          : "",
      nationality: user.nationality ?? "",
    };
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: onboardingService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      router.back();
    },
  });

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
            onSubmit={(values) => updateMutation.mutate(values)}
            isSubmitting={updateMutation.isPending}
            submitError={
              updateMutation.isError
                ? getApiErrorMessage(
                    updateMutation.error,
                    "Failed to update profile. Please try again.",
                  )
                : null
            }
            submitLabel="Save Changes"
            headerSlot={
              <View className="flex-row items-center pb-4">
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
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
