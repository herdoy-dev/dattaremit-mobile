import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import {
  create,
  open,
  LinkSuccess,
  LinkExit,
} from "react-native-plaid-link-sdk";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { plaidService } from "@/services/plaid";

export function usePlaidLink(options?: { onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const tokenMutation = useMutation({
    mutationFn: () =>
      plaidService.createLinkToken(
        Platform.OS === "android" ? "com.dattapay.mobile" : undefined
      ),
    onSuccess: (data) => {
      create({ token: data.data.plaid_token });
      setIsReady(true);
    },
    onError: (err) => {
      setError(
        isAxiosError(err)
          ? err.response?.data?.message || "Failed to initialize bank linking."
          : "Failed to initialize bank linking."
      );
    },
  });

  const exchangeMutation = useMutation({
    mutationFn: plaidService.addExternalAccount,
    onSuccess: () => options?.onSuccess?.(),
    onError: (err) => {
      setError(
        isAxiosError(err)
          ? err.response?.data?.message || "Failed to link bank account."
          : "Failed to link bank account."
      );
    },
  });

  useEffect(() => {
    if (!isReady) return;
    open({
      onSuccess: (success: LinkSuccess) => {
        const { publicToken, metadata } = success;
        const account = metadata.accounts[0];
        const institutionName = metadata.institution?.name || "";
        const accountName = account?.name || "Bank Account";

        exchangeMutation.mutate({
          accountName: institutionName
            ? `${institutionName} - ${accountName}`
            : accountName,
          paymentRail: "us_ach",
          plaidPublicToken: publicToken,
          plaidAccountId: account?.id ?? "",
        });
      },
      onExit: (exit: LinkExit) => {
        setIsReady(false);
        if (exit.error) {
          setError(exit.error.errorMessage || "Bank linking was interrupted.");
        }
      },
    });
  }, [isReady]);

  const initiate = useCallback(() => {
    setError(null);
    setIsReady(false);
    tokenMutation.mutate();
  }, []);

  return {
    initiate,
    error,
    isLoading: tokenMutation.isPending || exchangeMutation.isPending,
  };
}
