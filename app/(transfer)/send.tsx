import { KeyboardAvoidingView, Platform, ActivityIndicator, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { Landmark } from "lucide-react-native";
import { ContactSelect } from "@/components/transfer/contact-select";
import { AmountEntry } from "@/components/transfer/amount-entry";
import { SendSuccess } from "@/components/transfer/send-success";
import { sendMoney } from "@/services/transfer";
import { useAccountQuery } from "@/hooks/use-account-query";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useBiometricGate } from "@/hooks/use-biometric-gate";
import { useTransferStore } from "@/hooks/use-transfer-store";
import { amountSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";

export default function SendScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: account, isLoading } = useAccountQuery();
  const address = account?.data?.addresses?.[0];
  const isRestricted = account && address?.country !== "US";
  const hasBankConnected = !!account?.data?.hasBankAccount;

  const { gate } = useBiometricGate({
    promptMessage: "Verify your identity to send money",
  });

  const transfer = useTransferStore();

  const mutation = useMutation({
    mutationFn: sendMoney,
    onSuccess: (data) => {
      transfer.markSuccess(data.transactionId);
    },
  });

  async function handleSend() {
    if (transfer.sendingRef.current) return;
    const result = amountSchema.safeParse(transfer.amount);
    if (!result.success) {
      transfer.setAmountError(result.error.issues[0].message);
      return;
    }
    transfer.setAmountError(null);
    if (!transfer.selectedContact) return;

    transfer.sendingRef.current = true;
    const idempotencyKey = transfer.generateIdempotencyKey();
    try {
      await gate(() => {
        mutation.mutate({
          contactId: transfer.selectedContact!.id,
          amountCents: Math.round(parseFloat(transfer.amount) * 100),
          note: transfer.note || undefined,
          _idempotencyKey: idempotencyKey,
        });
      });
    } finally {
      transfer.sendingRef.current = false;
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
        <ActivityIndicator size="large" color={primary} />
      </SafeAreaView>
    );
  }

  if (isRestricted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-light-bg px-6 dark:bg-dark-bg">
        <Text className="text-center text-lg font-bold text-light-text dark:text-dark-text">
          This feature is not available in your region.
        </Text>
        <View className="mt-4">
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasBankConnected) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
        <ScreenHeader title="Send Money" />
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="mb-6 h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: `${primary}15` }}
          >
            <Landmark size={36} color={primary} />
          </View>
          <Text className="text-center text-xl font-bold text-light-text dark:text-dark-text">
            No Bank Account Connected
          </Text>
          <Text className="mt-3 px-4 text-center text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">
            Please connect your bank account to send money.
          </Text>
          <View className="mt-6 w-full">
            <Button
              title="Connect Bank Account"
              onPress={() => router.replace("/(transfer)/add-bank")}
              size="lg"
              className="w-full"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (transfer.step === "success") {
    return (
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
        <SendSuccess
          amount={transfer.amount}
          recipientName={transfer.selectedContact?.name ?? ""}
          transactionId={transfer.transactionId}
        />
      </SafeAreaView>
    );
  }

  if (transfer.step === "amount" && transfer.selectedContact) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <AmountEntry
            selectedContact={transfer.selectedContact}
            amount={transfer.amount}
            onAmountChange={transfer.updateAmount}
            amountError={transfer.amountError}
            note={transfer.note}
            onNoteChange={transfer.setNote}
            onSend={handleSend}
            onBack={transfer.goBackToSelect}
            isSending={mutation.isPending}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <ContactSelect
        searchQuery={transfer.searchQuery}
        onSearchChange={transfer.setSearchQuery}
        onSelectContact={transfer.selectContact}
      />
    </SafeAreaView>
  );
}
