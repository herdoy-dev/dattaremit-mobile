import { KeyboardAvoidingView, Platform, ActivityIndicator, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { Landmark } from "lucide-react-native";
import { RecipientList } from "@/components/transfer/recipient-list";
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
import type { Recipient } from "@/services/recipient";

export default function SendScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: account, isLoading } = useAccountQuery();
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
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Transfer failed. Please try again.";
      transfer.setAmountError(message);
    },
  });

  async function handleSend() {
    if (mutation.isPending) return;
    const result = amountSchema.safeParse(transfer.amount);
    if (!result.success) {
      transfer.setAmountError(result.error.issues[0].message);
      return;
    }

    const amountCents = Math.round(parseFloat(transfer.amount) * 100);
    if (amountCents < 100 || amountCents > 1000000) {
      transfer.setAmountError("Amount must be between $1.00 and $10,000.00");
      return;
    }

    transfer.setAmountError(null);
    if (!transfer.selectedRecipient) return;

    const idempotencyKey = transfer.generateIdempotencyKey();
    await gate(async () => {
      await mutation.mutateAsync({
        recipientId: transfer.selectedRecipient!.id,
        amountCents,
        note: transfer.note || undefined,
        _idempotencyKey: idempotencyKey,
      });
    });
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
        <ActivityIndicator size="large" color={primary} />
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
          recipientName={
            transfer.selectedRecipient
              ? `${transfer.selectedRecipient.firstName} ${transfer.selectedRecipient.lastName}`.trim()
              : ""
          }
          transactionId={transfer.transactionId}
        />
      </SafeAreaView>
    );
  }

  if (transfer.step === "amount" && transfer.selectedRecipient) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <AmountEntry
            selectedRecipient={transfer.selectedRecipient}
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
      <RecipientList
        onSelectRecipient={transfer.selectRecipient}
        onAddBank={(recipient: Recipient) =>
          router.push({
            pathname: "/(transfer)/recipient-bank",
            params: { recipientId: recipient.id },
          })
        }
      />
    </SafeAreaView>
  );
}
