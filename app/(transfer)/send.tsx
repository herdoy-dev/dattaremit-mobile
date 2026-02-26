import { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { ContactSelect } from "@/components/transfer/contact-select";
import { AmountEntry } from "@/components/transfer/amount-entry";
import { SendSuccess } from "@/components/transfer/send-success";
import { sendMoney, type Contact } from "@/services/transfer";
import { useAccountQuery } from "@/hooks/use-account-query";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useBiometricGate } from "@/hooks/use-biometric-gate";
import { validateAmount } from "@/lib/validation";

type Step = "select" | "amount" | "success";

export default function SendScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: account, isLoading } = useAccountQuery();

  const address = account?.data?.addresses?.[0];

  // Only US users can send money
  useEffect(() => {
    if (account && address?.country !== "US") {
      router.back();
    }
  }, [account, address]);

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

  async function handleSend() {
    const error = validateAmount(amount);
    if (error) {
      setAmountError(error);
      return;
    }
    setAmountError(null);
    if (!selectedContact) return;

    await gate(() => {
      mutation.mutate({
        contactId: selectedContact.id,
        amount: parseFloat(amount),
        note: note || undefined,
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
