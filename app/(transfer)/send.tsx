import { useState, useEffect, useRef } from "react";
import { KeyboardAvoidingView, Platform, ActivityIndicator, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { randomUUID } from "expo-crypto";

import { Landmark } from "lucide-react-native";
import { ContactSelect } from "@/components/transfer/contact-select";
import { AmountEntry } from "@/components/transfer/amount-entry";
import { SendSuccess } from "@/components/transfer/send-success";
import { sendMoney, type Contact } from "@/services/transfer";
import { useAccountQuery } from "@/hooks/use-account-query";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useBiometricGate } from "@/hooks/use-biometric-gate";
import { validateAmount } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";

type Step = "select" | "amount" | "success";

export default function SendScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: account, isLoading } = useAccountQuery();

  const address = account?.data?.addresses?.[0];

  // Only US users can send money
  const isRestricted = account && address?.country !== "US";
  const hasBankConnected = !!account?.data?.hasBankAccount;

  const { gate, isBlocked } = useBiometricGate({
    promptMessage: "Verify your identity to send money",
  });

  const [step, setStep] = useState<Step>("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");

  const mutation = useMutation({
    mutationFn: sendMoney,
    onSuccess: (data) => {
      setTransactionId(data.transactionId);
      setStep("success");
    },
  });

  function handleSelectContact(contact: Contact) {
    setSelectedContact(contact);
    setStep("amount");
  }

  const sendingRef = useRef(false);

  async function handleSend() {
    if (sendingRef.current) return;
    const error = validateAmount(amount);
    if (error) {
      setAmountError(error);
      return;
    }
    setAmountError(null);
    if (!selectedContact) return;

    sendingRef.current = true;
    const idempotencyKey = randomUUID();
    try {
      await gate(() => {
        mutation.mutate({
          contactId: selectedContact.id,
          amountCents: Math.round(parseFloat(amount) * 100),
          note: note || undefined,
          _idempotencyKey: idempotencyKey,
        });
      });
    } finally {
      sendingRef.current = false;
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
      <SafeAreaView className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg px-6">
        <Text className="text-lg font-bold text-light-text dark:text-dark-text text-center">
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
          <Text className="text-xl font-bold text-light-text dark:text-dark-text text-center">
            No Bank Account Connected
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary px-4">
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

  if (step === "success") {
    return (
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
        <SendSuccess
          amount={amount}
          recipientName={selectedContact?.name ?? ""}
          transactionId={transactionId}
        />
      </SafeAreaView>
    );
  }

  if (step === "amount" && selectedContact) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <AmountEntry
            selectedContact={selectedContact}
            amount={amount}
            onAmountChange={(text) => {
              setAmount(text);
              if (amountError) setAmountError(null);
            }}
            amountError={amountError}
            note={note}
            onNoteChange={setNote}
            onSend={handleSend}
            onBack={() => setStep("select")}
            isSending={mutation.isPending}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <ContactSelect
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectContact={handleSelectContact}
      />
    </SafeAreaView>
  );
}
