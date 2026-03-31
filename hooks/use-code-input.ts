import { useState, useRef, useEffect, useCallback } from "react";
import { TextInput } from "react-native";
import {
  VERIFICATION_CODE_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  MAX_VERIFY_ATTEMPTS,
} from "@/constants/limits";

const CODE_LENGTH = VERIFICATION_CODE_LENGTH;

interface UseCodeInputOptions {
  onComplete: (code: string) => void;
}

export function useCodeInput({ onComplete }: UseCodeInputOptions) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [resending, setResending] = useState(false);

  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  const handleChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/[^0-9]/g, "").slice(-1);
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);

      if (digit && index < CODE_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      }

      if (digit && index === CODE_LENGTH - 1 && newCode.every((d) => d)) {
        onComplete(newCode.join(""));
      }
    },
    [code, onComplete],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace" && !code[index] && index > 0) {
        inputs.current[index - 1]?.focus();
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
      }
    },
    [code],
  );

  const resetCode = useCallback(() => {
    setCode(Array(CODE_LENGTH).fill(""));
    inputs.current[0]?.focus();
  }, []);

  const startCooldown = useCallback(() => {
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    setAttempts(0);
  }, []);

  const isComplete = code.every((d) => d);
  const tooManyAttempts = attempts >= MAX_VERIFY_ATTEMPTS;

  return {
    code,
    inputs,
    handleChange,
    handleKeyPress,
    cooldownSeconds,
    attempts,
    setAttempts,
    resending,
    setResending,
    resetCode,
    startCooldown,
    isComplete,
    tooManyAttempts,
    codeLength: CODE_LENGTH,
  };
}
