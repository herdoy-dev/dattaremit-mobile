import { ScrollView, KeyboardAvoidingView, Platform, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ui/screen-header";
import { ManualBankForm } from "@/components/bank/manual-bank-form";
import { BankSuccessModal } from "@/components/bank/bank-success-modal";
import { addRecipientBank } from "@/services/recipient";
import { getApiErrorMessage } from "@/lib/utils";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { buildThemeVars } from "@/store/theme-store";
import { useState } from "react";

export default function RecipientBankScreen() {
  const router = useRouter();
  const { recipientId } = useLocalSearchParams<{ recipientId: string }>();
  const { primary, surface, rawColors } = useThemeColors();
  const themeVars = buildThemeVars(rawColors);
  const queryClient = useQueryClient();

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationFn: (values: Record<string, string>) =>
      addRecipientBank(recipientId, {
        bankName: values.bankName,
        accountName: values.accountName,
        accountNumber: values.accountNumber,
        ifsc: values.ifsc,
        branchName: values.branchName,
        bankAccountType: values.bankAccountType,
        phoneNumber: values.phoneNumber,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      setShowSuccessModal(true);
    },
  });

  const handleSubmit = (values: Record<string, string>) => {
    mutation.mutate(values);
  };

  if (!recipientId) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
        <ActivityIndicator size="large" color={primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScreenHeader title="Add Recipient Bank" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <ManualBankForm
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
            submitError={
              mutation.isError
                ? getApiErrorMessage(
                    mutation.error,
                    "Failed to add bank account. Please try again.",
                  )
                : null
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <BankSuccessModal
        visible={showSuccessModal}
        onDismiss={() => router.back()}
        primary={primary}
        surface={surface}
        themeVars={themeVars}
      />
    </SafeAreaView>
  );
}
