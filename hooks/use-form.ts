import { useState, useCallback } from "react";

type Validator<T> = (value: string, values: T) => string | null;

export function useForm<T extends Record<string, string>>(
  initialValues: T,
  validators: Partial<Record<keyof T, Validator<T>>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string | null>>>(
    {}
  );

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string | null>> = {};
    let isValid = true;

    for (const field in validators) {
      const validator = validators[field];
      if (validator) {
        const error = validator(values[field], values);
        newErrors[field] = error;
        if (error) isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validators]);

  const resetErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { values, errors, setValue, validate, resetErrors };
}
