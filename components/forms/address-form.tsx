import { type ReactNode, useEffect } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MapPin, Building2, Hash } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { CountrySelector } from "@/components/ui/country-selector";
import { useForm } from "@/hooks/use-form";
import { addressSchema, type AddressFormValues } from "@/lib/schemas";
import { COLORS } from "@/constants/theme";

interface AddressFormProps {
  initialValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  submitLabel: string;
  headerSlot?: ReactNode;
}

export function AddressForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitError,
  submitLabel,
  headerSlot,
}: AddressFormProps) {
  const { values, errors, setValue, validate } = useForm(
    {
      country: "",
      city: "",
      street: "",
      postalCode: "",
      state: "",
    },
    addressSchema,
  );

  useEffect(() => {
    if (initialValues) {
      if (initialValues.country) setValue("country", initialValues.country);
      if (initialValues.state) setValue("state", initialValues.state);
      if (initialValues.city) setValue("city", initialValues.city);
      if (initialValues.street) setValue("street", initialValues.street);
      if (initialValues.postalCode) setValue("postalCode", initialValues.postalCode);
    }
  }, [initialValues]);

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

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

        <Input
          label="State / Province"
          value={values.state}
          onChangeText={(t) => setValue("state", t)}
          placeholder="Enter state or province"
          autoCapitalize="words"
          error={errors.state}
          icon={<Building2 size={20} color={COLORS.placeholder} />}
        />

        <Input
          label="City"
          value={values.city}
          onChangeText={(t) => setValue("city", t)}
          placeholder="Enter your city"
          autoCapitalize="words"
          error={errors.city}
          icon={<MapPin size={20} color={COLORS.placeholder} />}
        />

        <Input
          label="Street Address"
          value={values.street}
          onChangeText={(t) => setValue("street", t)}
          placeholder="Enter your street address"
          autoCapitalize="words"
          error={errors.street}
          icon={<MapPin size={20} color={COLORS.placeholder} />}
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
