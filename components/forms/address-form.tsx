import { type ReactNode, useCallback, useEffect, useRef } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { AddressValidationBadge } from "@/components/ui/address-validation-badge";
import { AddressFields } from "@/components/forms/address-fields";
import { useForm } from "@/hooks/use-form";
import { addressSchema } from "@/lib/schemas";
import type { AddressValidationResult } from "@/types/address";

export interface AddressFormValues {
  country: string;
  state: string;
  city: string;
  street: string;
  postalCode: string;
}

// Map Google Address Validation componentType to form field names
const COMPONENT_TYPE_TO_FIELD: Record<string, keyof AddressFormValues> = {
  route: "street",
  street_number: "street",
  locality: "city",
  sublocality_level_1: "city",
  administrative_area_level_1: "state",
  postal_code: "postalCode",
  country: "country",
  subpremise: "street",
};

interface AddressFormProps {
  initialValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  submitLabel: string;
  headerSlot?: ReactNode;
  // Validation
  validationResult?: AddressValidationResult | null;
  isValidating?: boolean;
  onAcceptCorrections?: () => void;
  onFieldsComplete?: (values: AddressFormValues) => void;
}

export function AddressForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitError,
  submitLabel,
  headerSlot,
  validationResult,
  isValidating = false,
  onAcceptCorrections,
  onFieldsComplete,
}: AddressFormProps) {
  const { values, errors, setValue, validate } = useForm(
    {
      country: "US",
      city: "",
      street: "",
      postalCode: "",
      state: "",
    },
    addressSchema,
  );

  // Track whether we've already fired onFieldsComplete for current field values
  const lastCompletedRef = useRef<string>("");

  useEffect(() => {
    if (initialValues) {
      if (initialValues.country) setValue("country", initialValues.country);
      if (initialValues.state) setValue("state", initialValues.state);
      if (initialValues.city) setValue("city", initialValues.city);
      if (initialValues.street) setValue("street", initialValues.street);
      if (initialValues.postalCode) setValue("postalCode", initialValues.postalCode);
    }
  }, [initialValues, setValue]);

  // Fire onFieldsComplete when all fields are filled
  useEffect(() => {
    const { country, state, city, street, postalCode } = values;
    if (country && state && city && street && postalCode) {
      const key = `${country}|${state}|${city}|${street}|${postalCode}`;
      if (key !== lastCompletedRef.current) {
        lastCompletedRef.current = key;
        onFieldsComplete?.(values);
      }
    }
  }, [values, onFieldsComplete]);

  // Auto-correct postal code when validation suggests a different one
  useEffect(() => {
    if (validationResult?.validationStatus === "NEEDS_REVIEW" && validationResult.corrections) {
      const postalCorrection = validationResult.corrections.find((c) => c.field === "postal_code");
      if (postalCorrection) {
        setValue("postalCode", postalCorrection.corrected);
        // If postal code was the only correction, reset validation to re-run with corrected value
        if (validationResult.corrections.length === 1) {
          onAcceptCorrections?.();
        }
      }
    }
  }, [validationResult, onAcceptCorrections, setValue]);

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  const handleAcceptCorrections = useCallback(() => {
    if (validationResult?.corrections) {
      for (const correction of validationResult.corrections) {
        const formField = COMPONENT_TYPE_TO_FIELD[correction.field];
        if (formField) {
          setValue(formField, correction.corrected);
        }
      }
    }
    onAcceptCorrections?.();
  }, [validationResult, setValue, onAcceptCorrections]);

  return (
    <>
      {headerSlot}
      <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} className="gap-5">
        <AddressFields
          values={values}
          errors={errors}
          setValue={setValue}
          onAutoFill={(sc) => {
            if (sc.country) setValue("country", sc.country);
          }}
        />

        {(validationResult || isValidating) && (
          <AddressValidationBadge
            status={validationResult?.validationStatus ?? "UNAVAILABLE"}
            isValidating={isValidating}
            corrections={validationResult?.corrections}
            formattedAddress={validationResult?.formattedAddress}
            onAcceptCorrections={handleAcceptCorrections}
          />
        )}

        {submitError && <ErrorBanner message={submitError} />}

        <Button
          title={submitLabel}
          onPress={handleSubmit}
          loading={isSubmitting}
          size="lg"
          className="mt-2"
        />
      </Animated.View>
    </>
  );
}
