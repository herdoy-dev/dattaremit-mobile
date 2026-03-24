import Animated, { FadeInDown } from "react-native-reanimated";
import { User, Hash, Building2, Landmark } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { useForm } from "@/hooks/use-form";
import { bankAccountSchema } from "@/lib/schemas";
import { COLORS } from "@/constants/theme";

const ACCOUNT_TYPE_OPTIONS = [
  { label: "Savings", value: "SAVINGS" },
  { label: "Current", value: "CURRENT" },
];

interface ManualBankFormProps {
  onSubmit: (values: Record<string, string>) => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export function ManualBankForm({ onSubmit, isSubmitting, submitError }: ManualBankFormProps) {
  const { values, errors, setValue, validate } = useForm(
    {
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifsc: "",
      branchName: "",
      bankAccountType: "",
      phoneNumber: "",
    },
    bankAccountSchema,
  );

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} className="gap-5">
      <Input
        label="Bank Name"
        value={values.bankName}
        onChangeText={(t) => setValue("bankName", t)}
        placeholder="Enter bank name"
        autoCapitalize="words"
        error={errors.bankName}
        icon={<Building2 size={20} color={COLORS.placeholder} />}
      />

      <Input
        label="Account Holder Name"
        value={values.accountName}
        onChangeText={(t) => setValue("accountName", t)}
        placeholder="Enter account holder name"
        autoCapitalize="words"
        error={errors.accountName}
        icon={<User size={20} color={COLORS.placeholder} />}
      />

      <Input
        label="Account Number"
        value={values.accountNumber}
        onChangeText={(t) => setValue("accountNumber", t)}
        placeholder="Enter account number"
        keyboardType="number-pad"
        error={errors.accountNumber}
        icon={<Hash size={20} color={COLORS.placeholder} />}
      />

      <Input
        label="IFSC Code"
        value={values.ifsc}
        onChangeText={(t) => setValue("ifsc", t.toUpperCase())}
        placeholder="e.g. SBIN0001234"
        autoCapitalize="characters"
        error={errors.ifsc}
        icon={<Landmark size={20} color={COLORS.placeholder} />}
      />

      <Input
        label="Branch Name"
        value={values.branchName}
        onChangeText={(t) => setValue("branchName", t)}
        placeholder="Enter branch name"
        autoCapitalize="words"
        error={errors.branchName}
        icon={<Building2 size={20} color={COLORS.placeholder} />}
      />

      <CustomDropdown
        label="Account Type"
        options={ACCOUNT_TYPE_OPTIONS}
        value={values.bankAccountType}
        onChange={(v) => setValue("bankAccountType", v)}
        placeholder="Select account type"
        error={errors.bankAccountType}
      />

      <Input
        label="Phone Number"
        value={values.phoneNumber}
        onChangeText={(t) => setValue("phoneNumber", t)}
        placeholder="+919838387750"
        keyboardType="phone-pad"
        error={errors.phoneNumber}
        icon={<Hash size={20} color={COLORS.placeholder} />}
      />

      {submitError && <ErrorBanner message={submitError} />}

      <Button
        title="Add Bank Account"
        onPress={handleSubmit}
        loading={isSubmitting}
        size="lg"
        className="mt-2"
      />
    </Animated.View>
  );
}
