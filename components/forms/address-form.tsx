import { type ReactNode, useCallback, useEffect, useRef } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MapPin, Building2, Hash } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { CountrySelector } from "@/components/ui/country-selector";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { AddressValidationBadge } from "@/components/ui/address-validation-badge";
import { useForm } from "@/hooks/use-form";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import { validateRequired, validatePostalCode } from "@/lib/validation";
import { COLORS } from "@/constants/theme";
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
      country: "",
      city: "",
      street: "",
      postalCode: "",
      state: "",
    },
    {
      country: (v) => validateRequired(v, "Country"),
      city: (v) => validateRequired(v, "City"),
      street: (v) => validateRequired(v, "Street address"),
      postalCode: (v) => validatePostalCode(v),
      state: (v) => validateRequired(v, "State/Province"),
    },
  );

  // Track whether we've already fired onFieldsComplete for current field values
  const lastCompletedRef = useRef<string>("");

  // Derive country for autocomplete filtering
  const country = values.country === "US" || values.country === "IN" ? values.country : undefined;

  // Three independent autocomplete instances
  const stateAC = useAddressAutocomplete({
    country,
    types: "(regions)",
    mode: "simple",
  });

  const cityAC = useAddressAutocomplete({
    country,
    locationContext: { state: values.state },
    types: "(cities)",
    mode: "simple",
  });

  const streetAC = useAddressAutocomplete({
    country,
    locationContext: { state: values.state, city: values.city },
    types: "address",
    mode: "full",
  });

  useEffect(() => {
    if (initialValues) {
      if (initialValues.country) setValue("country", initialValues.country);
      if (initialValues.state) setValue("state", initialValues.state);
      if (initialValues.city) setValue("city", initialValues.city);
      if (initialValues.street) setValue("street", initialValues.street);
      if (initialValues.postalCode) setValue("postalCode", initialValues.postalCode);
    }
  }, [initialValues]);

  // Auto-fill all fields when street place details are fetched
  useEffect(() => {
    const sc = streetAC.selectedComponents;
    if (sc) {
      if (sc.street) setValue("street", sc.street);
      if (sc.city) setValue("city", sc.city);
      if (sc.state) setValue("state", sc.state);
      if (sc.postalCode) setValue("postalCode", sc.postalCode);
      if (sc.country) setValue("country", sc.country);
    }
  }, [streetAC.selectedComponents]);

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
  }, [validationResult]);

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  const handleStreetChange = (text: string) => {
    setValue("street", text);
    streetAC.onSearchChange(text);
  };

  const handleStateChange = (text: string) => {
    setValue("state", text);
    stateAC.onSearchChange(text);
  };

  const handleCityChange = (text: string) => {
    setValue("city", text);
    cityAC.onSearchChange(text);
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
        <CountrySelector
          label="Country"
          value={values.country}
          onChange={(v) => setValue("country", v)}
          placeholder="Select your country"
          error={errors.country}
        />

        <AddressAutocomplete
          label="State / Province"
          value={values.state}
          onChangeText={handleStateChange}
          suggestions={stateAC.suggestions}
          onSelect={(p) => setValue("state", p.mainText)}
          isLoading={stateAC.isSearching}
          placeholder="Enter state or province"
          emptyText="No states found"
          error={errors.state}
          icon={<Building2 size={20} color={COLORS.placeholder} />}
          className="z-40"
        />

        <AddressAutocomplete
          label="City"
          value={values.city}
          onChangeText={handleCityChange}
          suggestions={cityAC.suggestions}
          onSelect={(p) => setValue("city", p.mainText)}
          isLoading={cityAC.isSearching}
          placeholder="Enter your city"
          emptyText="No cities found"
          error={errors.city}
          icon={<MapPin size={20} color={COLORS.placeholder} />}
          className="z-30"
        />

        <AddressAutocomplete
          label="Street Address"
          value={values.street}
          onChangeText={handleStreetChange}
          suggestions={streetAC.suggestions}
          onSelect={(p) => {
            setValue("street", p.mainText);
            streetAC.onSelect(p);
          }}
          isLoading={streetAC.isSearching}
          placeholder="Enter your street address"
          error={errors.street}
          icon={<MapPin size={20} color={COLORS.placeholder} />}
          className="z-50"
        />

        <Input
          label="Postal Code"
          value={values.postalCode}
          onChangeText={(t) => setValue("postalCode", t)}
          placeholder="Enter postal code"
          keyboardType="number-pad"
          error={errors.postalCode}
          icon={<Hash size={20} color={COLORS.placeholder} />}
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
