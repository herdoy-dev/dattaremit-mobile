import { useState, useCallback } from "react";
import type { z } from "zod";

export function useForm<T extends Record<string, string>>(
  initialValues: T,
  schema: z.ZodType<unknown>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string | null>>>({});

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
    const result = schema.safeParse(values);
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
  }, [values, schema]);

  const resetErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { values, errors, setValue, validate, resetErrors };
}
