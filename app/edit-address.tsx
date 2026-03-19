import { useMemo } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";
import { AddressForm } from "@/components/forms/address-form";
import { onboardingService } from "@/services/onboarding";
import { useAccountQuery } from "@/hooks/use-account-query";
import { getApiErrorMessage } from "@/lib/utils";
import { COLORS } from "@/constants/theme";

export default function EditAddressScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account } = useAccountQuery();
  const address = account?.data?.addresses?.[0];

  const initialValues = useMemo(() => {
    if (!address) return undefined;
    return {
      country: address.country ?? "",
      city: address.city ?? "",
      street: address.addressLine1 ?? "",
      postalCode: address.postalCode ?? "",
      state: address.state ?? "",
    };
  }, [address]);

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof onboardingService.updateAddress>[1]) =>
      onboardingService.updateAddress(address!.id, payload),
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
          <AddressForm
            initialValues={initialValues}
            onSubmit={(values) => updateMutation.mutate(values)}
            isSubmitting={updateMutation.isPending}
            submitError={
              updateMutation.isError
                ? getApiErrorMessage(
                    updateMutation.error,
                    "Failed to update address. Please try again.",
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
                    Edit Address
                  </Text>
                  <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Update your address information
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
