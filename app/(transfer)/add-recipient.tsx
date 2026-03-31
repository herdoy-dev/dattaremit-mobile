import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import { User, Mail, Phone, MapPin, Calendar, Building2 } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useForm } from "@/hooks/use-form";
import { addRecipientSchema } from "@/lib/schemas";
import { createRecipient } from "@/services/recipient";
import { getApiErrorMessage } from "@/lib/utils";
import { COLORS } from "@/constants/theme";

export default function AddRecipientScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { values, errors, setValue, validate } = useForm(
    {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "+91",
      dateOfBirth: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
    },
    addRecipientSchema,
  );

  const mutation = useMutation({
    mutationFn: () => {
      const phone = values.phoneNumber.replace(/[\s-]/g, "");
      // Extract prefix and number
      let phoneNumberPrefix = "+91";
      let phoneNumber = phone;
      if (phone.startsWith("+91")) {
        phoneNumberPrefix = "+91";
        phoneNumber = phone.slice(3);
      } else if (phone.startsWith("+1")) {
        phoneNumberPrefix = "+1";
        phoneNumber = phone.slice(2);
      }

      return createRecipient({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phoneNumberPrefix,
        phoneNumber,
        dateOfBirth: new Date(values.dateOfBirth).toISOString(),
        addressLine1: values.addressLine1.trim(),
        addressLine2: values.addressLine2?.trim() || undefined,
        city: values.city.trim(),
        state: values.state.trim(),
        postalCode: values.postalCode.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      router.back();
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScreenHeader title="Add Recipient" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
            className="gap-5"
          >
            <Input
              label="First Name"
              value={values.firstName}
              onChangeText={(t) => setValue("firstName", t)}
              placeholder="Enter first name"
              autoCapitalize="words"
              error={errors.firstName}
              icon={<User size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="Last Name"
              value={values.lastName}
              onChangeText={(t) => setValue("lastName", t)}
              placeholder="Enter last name"
              autoCapitalize="words"
              error={errors.lastName}
              icon={<User size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="Email"
              value={values.email}
              onChangeText={(t) => setValue("email", t)}
              placeholder="recipient@example.com"
              keyboardType="email-address"
              error={errors.email}
              icon={<Mail size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="Phone Number"
              value={values.phoneNumber}
              onChangeText={(t) => setValue("phoneNumber", t)}
              placeholder="+919876543210"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              icon={<Phone size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="Date of Birth"
              value={values.dateOfBirth}
              onChangeText={(t) => setValue("dateOfBirth", t)}
              placeholder="YYYY-MM-DD"
              error={errors.dateOfBirth}
              icon={<Calendar size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="Address Line 1"
              value={values.addressLine1}
              onChangeText={(t) => setValue("addressLine1", t)}
              placeholder="Street address"
              autoCapitalize="words"
              error={errors.addressLine1}
              icon={<MapPin size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="Address Line 2 (Optional)"
              value={values.addressLine2}
              onChangeText={(t) => setValue("addressLine2", t)}
              placeholder="Apartment, suite, etc."
              autoCapitalize="words"
              error={errors.addressLine2}
            />

            <Input
              label="City"
              value={values.city}
              onChangeText={(t) => setValue("city", t)}
              placeholder="Enter city"
              autoCapitalize="words"
              error={errors.city}
              icon={<Building2 size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="State"
              value={values.state}
              onChangeText={(t) => setValue("state", t)}
              placeholder="Enter state"
              autoCapitalize="words"
              error={errors.state}
              icon={<Building2 size={20} color={COLORS.placeholder} />}
            />

            <Input
              label="Postal Code"
              value={values.postalCode}
              onChangeText={(t) => setValue("postalCode", t)}
              placeholder="Enter postal code"
              keyboardType="number-pad"
              error={errors.postalCode}
              icon={<MapPin size={20} color={COLORS.placeholder} />}
            />

            {mutation.isError && (
              <ErrorBanner
                message={getApiErrorMessage(
                  mutation.error,
                  "Failed to add recipient. Please try again.",
                )}
              />
            )}

            <Button
              title="Add Recipient"
              onPress={handleSubmit}
              loading={mutation.isPending}
              size="lg"
              className="mt-2"
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
