import { type ReactNode, useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { User } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { CountrySelector } from "@/components/ui/country-selector";
import { PhoneInput } from "@/components/ui/phone-input";
import { useForm } from "@/hooks/use-form";
import { profileSchema, type ProfileFormValues } from "@/lib/schemas";
import { COLORS } from "@/constants/theme";
import { COUNTRIES } from "@/lib/countries";

interface ProfileFormProps {
  initialValues?: Partial<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  submitLabel: string;
  headerSlot?: ReactNode;
}

export function ProfileForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitError,
  submitLabel,
  headerSlot,
}: ProfileFormProps) {
  const { values, errors, setValue, validate } = useForm(
    {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phoneNumber: "",
      nationality: "",
    },
    profileSchema,
  );

  useEffect(() => {
    if (initialValues) {
      if (initialValues.firstName) setValue("firstName", initialValues.firstName);
      if (initialValues.lastName) setValue("lastName", initialValues.lastName);
      if (initialValues.dateOfBirth) setValue("dateOfBirth", initialValues.dateOfBirth);
      if (initialValues.phoneNumber) setValue("phoneNumber", initialValues.phoneNumber);
      if (initialValues.nationality) setValue("nationality", initialValues.nationality);
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
        <View className="flex-row gap-3">
          <Input
            label="First Name"
            value={values.firstName}
            onChangeText={(t) => setValue("firstName", t)}
            placeholder="First name"
            autoCapitalize="words"
            error={errors.firstName}
            icon={<User size={20} color={COLORS.placeholder} />}
            className="flex-1"
          />
          <Input
            label="Last Name"
            value={values.lastName}
            onChangeText={(t) => setValue("lastName", t)}
            placeholder="Last name"
            autoCapitalize="words"
            error={errors.lastName}
            icon={<User size={20} color={COLORS.placeholder} />}
            className="flex-1"
          />
        </View>

        <CustomDatePicker
          label="Date of Birth"
          value={values.dateOfBirth}
          onChange={(d) => setValue("dateOfBirth", d)}
          error={errors.dateOfBirth}
        />

        <CountrySelector
          label="Nationality"
          value={values.nationality}
          onChange={(v) => {
            setValue("nationality", v);
            const country = COUNTRIES.find((c) => c.code === v);
            if (country) {
              setValue("phoneNumber", country.dial);
            }
          }}
          placeholder="Select your nationality"
          error={errors.nationality}
        />

        <PhoneInput
          label="Phone Number"
          value={values.phoneNumber}
          onChangePhone={(t) => setValue("phoneNumber", t)}
          placeholder="Enter phone number"
          error={errors.phoneNumber}
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
