import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import {
  create,
  open,
  LinkSuccess,
  LinkExit,
} from "react-native-plaid-link-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { plaidService } from "@/services/plaid";
import { getApiErrorMessage } from "@/lib/utils";

export function usePlaidLink(options?: { onSuccess?: () => void; paymentRail?: string }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const tokenMutation = useMutation({
    mutationFn: () =>
      Sentry.startSpan(
        { name: "plaid.create_link_token", op: "http.client" },
        () =>
          plaidService.createLinkToken(
            Platform.OS === "android" ? "com.dattapay.mobile" : undefined,
          ),
      ),
    onSuccess: (data) => {
      create({ token: data.data.plaid_token });
      setIsReady(true);
    },
    onError: (err: unknown) => {
      setError(getApiErrorMessage(err, "Failed to initialize bank linking."));
    },
  });

  const exchangeMutation = useMutation({
    mutationFn: (payload: Parameters<typeof plaidService.addExternalAccount>[0]) =>
      Sentry.startSpan(
        { name: "plaid.exchange_token", op: "http.client" },
        () => plaidService.addExternalAccount(payload),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      options?.onSuccess?.();
    },
    onError: (err: unknown) => {
      setError(getApiErrorMessage(err, "Failed to link bank account."));
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
          paymentRail: options?.paymentRail || "ach_pull",
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
