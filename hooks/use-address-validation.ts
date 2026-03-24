import { useMutation } from "@tanstack/react-query";
import { addressService } from "@/services/address";
import type { AddressValidationResult } from "@/types/address";

export function useAddressValidation() {
  const mutation = useMutation({
    mutationFn: addressService.validateAddress,
  });

  return {
    validate: mutation.mutate,
    validationResult: mutation.data as AddressValidationResult | undefined,
    isValidating: mutation.isPending,
    reset: mutation.reset,
  };
}
