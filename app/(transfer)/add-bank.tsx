import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAccountQuery } from "@/hooks/use-account-query";
import { usePlaidLink } from "@/hooks/use-plaid-link";
import { useBiometricGate } from "@/hooks/use-biometric-gate";
import { ScreenHeader } from "@/components/ui/screen-header";
import { KycGateView } from "@/components/bank/kyc-gate-view";
import { PlaidBankFlow } from "@/components/bank/plaid-bank-flow";
import { BankSuccessModal } from "@/components/bank/bank-success-modal";
import { buildThemeVars } from "@/store/theme-store";

export default function AddBankScreen() {
  const router = useRouter();
  const { primary, surface, rawColors } = useThemeColors();
  const themeVars = buildThemeVars(rawColors);

  const { data: account, isLoading: isAccountLoading } = useAccountQuery();
  const accountStatus = account?.data?.accountStatus;
  const achPushEnabled = !!account?.data?.user?.achPushEnabled;
  const hasBankAccount = !!account?.data?.hasBankAccount;

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { gate } = useBiometricGate({
    promptMessage: "Verify your identity to link a bank account",
  });

  const plaid = usePlaidLink({
    onSuccess: () => setShowSuccessModal(true),
    paymentRail: "ach_pull",
  });

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScreenHeader title="Add Bank" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          {isAccountLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color={primary} />
            </View>
          ) : accountStatus !== "ACTIVE" ? (
            <KycGateView accountStatus={accountStatus!} primary={primary} />
          ) : (
            <PlaidBankFlow
              hasBankAccount={hasBankAccount}
              achPushEnabled={achPushEnabled}
              primary={primary}
              plaid={plaid}
              onGate={gate}
            />
          )}
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
