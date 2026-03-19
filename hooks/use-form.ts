import { useState, useCallback } from "react";
import type { z } from "zod";

type Validator<T> = (value: string, values: T) => string | null;

type UseFormOptions<T extends Record<string, string>> = {
  validators?: Partial<Record<keyof T, Validator<T>>>;
  schema?: z.ZodType<unknown>;
};

export function useForm<T extends Record<string, string>>(
  initialValues: T,
  validatorsOrOptions?: Partial<Record<keyof T, Validator<T>>> | UseFormOptions<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string | null>>>({});

  // Support both old API (validators object) and new API (options with schema)
  const options: UseFormOptions<T> =
    validatorsOrOptions && "schema" in validatorsOrOptions
      ? validatorsOrOptions
      : { validators: validatorsOrOptions as Partial<Record<keyof T, Validator<T>>> };

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    // Zod schema validation
    if (options.schema) {
      const result = options.schema.safeParse(values);
      if (result.success) {
        setErrors({});
        return true;
      }

      const newErrors: Partial<Record<keyof T, string | null>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof T;
        if (field && !newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }
      setErrors(newErrors);
      return false;
    }

    // Legacy imperative validators
    if (options.validators) {
      const newErrors: Partial<Record<keyof T, string | null>> = {};
      let isValid = true;

      for (const field in options.validators) {
        const validator = options.validators[field];
        if (validator) {
          const error = validator(values[field], values);
          newErrors[field] = error;
          if (error) isValid = false;
        }
      }

      setErrors(newErrors);
      return isValid;
    }

    return true;
  }, [values, options.validators, options.schema]);

  const resetErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { values, errors, setValue, validate, resetErrors };
}
