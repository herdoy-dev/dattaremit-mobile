import { useQuery } from "@tanstack/react-query";
import { onboardingService } from "@/services/onboarding";
import type { AccountStatusResponse } from "@/types/api";

export function useAccountQuery() {
  return useQuery<AccountStatusResponse>({
    queryKey: ["account"],
    queryFn: () => onboardingService.getAccountStatus(),
  });
}
