import { useState, useCallback } from "react";
import { randomUUID } from "expo-crypto";
import type { Contact } from "@/services/transfer";

type TransferStep = "select" | "amount" | "success";

export function useTransferStore() {
  const [step, setStep] = useState<TransferStep>("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");

  const selectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setStep("amount");
  }, []);

  const goBackToSelect = useCallback(() => {
    setStep("select");
  }, []);

  const markSuccess = useCallback((txnId: string) => {
    setTransactionId(txnId);
    setStep("success");
  }, []);

  const updateAmount = useCallback(
    (text: string) => {
      setAmount(text);
      if (amountError) setAmountError(null);
    },
    [amountError],
  );

  const generateIdempotencyKey = useCallback(() => randomUUID(), []);

  return {
    step,
    searchQuery,
    setSearchQuery,
    selectedContact,
    selectContact,
    amount,
    updateAmount,
    note,
    setNote,
    amountError,
    setAmountError,
    transactionId,
    markSuccess,
    goBackToSelect,
    generateIdempotencyKey,
  };
}
