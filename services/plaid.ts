import apiClient from "@/lib/api-client";

export interface ExternalAccountPayload {
  accountName: string;
  paymentRail: string;
  plaidPublicToken: string;
  plaidAccountId: string;
}

export const plaidService = {
  async createLinkToken(androidPackageName?: string) {
    const response = await apiClient.post("/zynk/plaid-link-token", {
      ...(androidPackageName && { android_package_name: androidPackageName }),
    });
    return response.data;
  },

  async addExternalAccount(payload: ExternalAccountPayload) {
    const response = await apiClient.post("/zynk/external-account", payload);
    return response.data;
  },
};
