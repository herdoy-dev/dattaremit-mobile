import { useCallback, useMemo, useRef } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { AddressForm, type AddressFormValues } from "@/components/forms/address-form";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { useAccountQuery } from "@/hooks/use-account-query";
import { useAddressValidation } from "@/hooks/use-address-validation";
import { getApiErrorMessage } from "@/lib/utils";

const VALIDATION_DEBOUNCE_MS = 800;

export default function AddressScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: accountData } = useAccountQuery();
  const existingAddress = accountData?.data?.addresses?.[0];

  const initialValues = useMemo(() => {
    if (!existingAddress) return undefined;
    return {
      country: existingAddress.country,
      city: existingAddress.city,
      street: existingAddress.addressLine1,
      postalCode: existingAddress.postalCode,
      state: existingAddress.state,
    };
  }, [existingAddress]);

  const {
    validate,
    validationResult,
    isValidating,
    reset: resetValidation,
  } = useAddressValidation();

  const addressMutation = useMutation({
    mutationFn: onboardingService.submitAddress,
    onSuccess: async () => {
      await setStep("kyc");
      router.push("/(onboarding)/kyc");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof onboardingService.updateAddress>[1]) =>
      onboardingService.updateAddress(existingAddress!.id, payload),
    onSuccess: async () => {
      await setStep("kyc");
      router.push("/(onboarding)/kyc");
    },
  });

  const activeMutation = existingAddress ? updateMutation : addressMutation;

  const handleSubmit = (values: AddressFormValues) => {
    if (existingAddress) {
      updateMutation.mutate(values);
    } else {
      addressMutation.mutate(values);
    }
  };

  const handleFieldsComplete = useCallback(
    (values: AddressFormValues) => {
      if (validationTimerRef.current) clearTimeout(validationTimerRef.current);
      validationTimerRef.current = setTimeout(() => {
        validate({
          addressLine1: values.street,
          city: values.city,
          state: values.state,
          country: values.country as "US",
          postalCode: values.postalCode,
        });
      }, VALIDATION_DEBOUNCE_MS);
    },
    [validate],
  );

  const handleAcceptCorrections = useCallback(() => {
    resetValidation();
  }, [resetValidation]);

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
            onSubmit={handleSubmit}
            isSubmitting={activeMutation.isPending}
            submitError={
              activeMutation.isError
                ? getApiErrorMessage(
                    activeMutation.error,
                    "Failed to save address. Please try again.",
                  )
                : null
            }
            submitLabel={existingAddress ? "Update & Continue" : "Continue"}
            validationResult={validationResult}
            isValidating={isValidating}
            onFieldsComplete={handleFieldsComplete}
            onAcceptCorrections={handleAcceptCorrections}
            headerSlot={
              <View className="pb-4">
                <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                  Address Information
                </Text>
                <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Where are you located?
                </Text>
              </View>
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
