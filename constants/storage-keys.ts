export const STORAGE_KEYS = {
  REFERRAL_CODE: "referral_code",
  THEME_PRESET: "theme_preset",
  PUSH_TOKEN: "push_token",
  DEVICE_ID: "device_id",
  NOTIFICATION_PERMISSION_ASKED: "notification_permission_asked",
} as const;

export const SECURE_KEYS = {
  BIOMETRIC_ENABLED: "biometric_enabled",
  BIOMETRIC_USER_ID: "biometric_user_id",
  BIOMETRIC_PROMPT_SHOWN: "biometric_prompt_shown",
  ONBOARDING_STEP: "onboarding_step",
  BIOMETRIC_FAILURES: "biometric_failures",
} as const;
