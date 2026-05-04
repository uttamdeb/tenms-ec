import { TenMSAuth } from "@tenminuteschool/auth-react";

export const TENMS_CLIENT_ID = "tenms_97b90a8f9c72ba6c3dc777c37df5ea9d";

export const tenmsAuth = new TenMSAuth({
  clientId: TENMS_CLIENT_ID,
  // storage: "localStorage",
});