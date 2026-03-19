import { useState, useCallback } from "react";
import { useSSO } from "@clerk/clerk-expo";
import * as Sentry from "@sentry/react-native";
import { usePostAuthRouting } from "@/hooks/use-post-auth-routing";
import { getClerkErrorMessage } from "@/lib/utils";

export function useSocialAuth() {
  const { startSSOFlow } = useSSO();
  const { routeAfterAuth } = usePostAuthRouting();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSocialAuth = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      setLoadingAction(strategy);
      setAuthError(null);

      try {
        await Sentry.startSpan(
          { name: `auth.social.${strategy}`, op: "auth" },
          async () => {
            const { createdSessionId, setActive: ssoSetActive } =
              await Sentry.startSpan(
                { name: "auth.social.sso_flow", op: "auth.sso" },
                () => startSSOFlow({ strategy }),
              );

            if (createdSessionId && ssoSetActive) {
              await Sentry.startSpan(
                { name: "auth.social.set_active", op: "auth.session" },
                () => ssoSetActive({ session: createdSessionId }),
              );
              await routeAfterAuth();
            }
          },
        );
      } catch (err: unknown) {
        Sentry.captureException(err);
        setAuthError(
          getClerkErrorMessage(err, "Social sign-in failed. Please try again.")
        );
      } finally {
        setLoadingAction(null);
      }
    },
    [startSSOFlow, routeAfterAuth]
  );

  return {
    handleSocialAuth,
    loadingAction,
    setLoadingAction,
    authError,
    setAuthError,
  };
}
