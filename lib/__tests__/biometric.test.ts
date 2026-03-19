import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import {
  getHardwareStatus,
  authenticate,
  getEnrollmentState,
  setEnrollmentState,
  hasBeenPrompted,
  markPrompted,
  clearEnrollment,
  getBiometricLabel,
  getBiometricIconType,
} from "../biometric";

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getHardwareStatus", () => {
  it("returns hardware status", async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([1]);

    const result = await getHardwareStatus();
    expect(result).toEqual({
      hasHardware: true,
      isEnrolled: true,
      authenticationType: [1],
    });
  });
});

describe("authenticate", () => {
  it("returns success on successful auth", async () => {
    mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true });

    const result = await authenticate("Verify identity");
    expect(result).toEqual({ success: true, error: undefined });
    expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: "Verify identity" }),
    );
  });

  it("returns error on failed auth", async () => {
    mockLocalAuth.authenticateAsync.mockResolvedValue({
      success: false,
      error: "user_cancel",
    });

    const result = await authenticate("Verify identity");
    expect(result).toEqual({ success: false, error: "user_cancel" });
  });
});

describe("getEnrollmentState", () => {
  it("returns true when enabled", async () => {
    mockSecureStore.getItemAsync.mockResolvedValue("true");
    expect(await getEnrollmentState("user1")).toBe(true);
  });

  it("returns false when not enabled", async () => {
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    expect(await getEnrollmentState("user1")).toBe(false);
  });
});

describe("setEnrollmentState", () => {
  it("stores enabled state and user ID", async () => {
    await setEnrollmentState("user1", true);
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("biometric_enabled_user1", "true");
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("biometric_user_id", "user1");
  });

  it("stores disabled state without setting user ID", async () => {
    await setEnrollmentState("user1", false);
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("biometric_enabled_user1", "false");
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });
});

describe("hasBeenPrompted", () => {
  it("returns true when prompted", async () => {
    mockSecureStore.getItemAsync.mockResolvedValue("true");
    expect(await hasBeenPrompted("user1")).toBe(true);
  });

  it("returns false when not prompted", async () => {
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    expect(await hasBeenPrompted("user1")).toBe(false);
  });
});

describe("markPrompted", () => {
  it("stores prompted state", async () => {
    await markPrompted("user1");
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
      "biometric_prompt_shown_user1",
      "true",
    );
  });
});

describe("clearEnrollment", () => {
  it("clears all enrollment data when user ID exists", async () => {
    mockSecureStore.getItemAsync.mockResolvedValue("user1");

    await clearEnrollment();

    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("biometric_enabled_user1");
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("biometric_prompt_shown_user1");
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("biometric_user_id");
  });

  it("only clears user ID key when no stored user", async () => {
    mockSecureStore.getItemAsync.mockResolvedValue(null);

    await clearEnrollment();

    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("biometric_user_id");
  });
});

describe("getBiometricLabel", () => {
  it("returns 'Face ID' for iOS with facial recognition", () => {
    (Platform as any).OS = "ios";
    expect(getBiometricLabel([2])).toBe("Face ID");
  });

  it("returns 'Touch ID' for iOS with fingerprint", () => {
    (Platform as any).OS = "ios";
    expect(getBiometricLabel([1])).toBe("Touch ID");
  });

  it("returns 'Biometrics' for Android", () => {
    (Platform as any).OS = "android";
    expect(getBiometricLabel([1, 2])).toBe("Biometrics");
  });

  it("returns 'Biometrics' for iOS with no recognized types", () => {
    (Platform as any).OS = "ios";
    expect(getBiometricLabel([])).toBe("Biometrics");
  });
});

describe("getBiometricIconType", () => {
  it("returns 'face' for facial recognition", () => {
    expect(getBiometricIconType([2])).toBe("face");
  });

  it("returns 'fingerprint' for fingerprint", () => {
    expect(getBiometricIconType([1])).toBe("fingerprint");
  });

  it("returns 'fingerprint' for empty types", () => {
    expect(getBiometricIconType([])).toBe("fingerprint");
  });
});
