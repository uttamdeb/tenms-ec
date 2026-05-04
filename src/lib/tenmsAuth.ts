import { TenMSAuth } from "@tenminuteschool/auth-react";

export const TENMS_CLIENT_ID = "tenms_97b90a8f9c72ba6c3dc777c37df5ea9d";

const redirectUri =
  typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}`
    : undefined;
    
export const tenmsAuth = new TenMSAuth({
  clientId: TENMS_CLIENT_ID,
  redirectUri,
  // storage: "localStorage", // optional; default is "cookie"
});


