import { useMemo, useState } from "react";
import { LoginButton, TenMSAuth } from "@tenminuteschool/auth-react";
import type { AuthResponse } from "@tenminuteschool/auth-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TENMS_CLIENT_ID = "tenms_e0508a637433a0a4d850f016fca8dd41";

export function TenMSLoginButton({ disabled }: { disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const auth = useMemo(
    () => new TenMSAuth({ clientId: TENMS_CLIENT_ID, storage: "localStorage" }),
    [],
  );

  const handleSuccess = async (response: AuthResponse) => {
    setBusy(true);
    try {
      // SDK does the PKCE exchange + userinfo for us.
      const session = await auth.handleLoginSuccess(response);
      const accessToken = session.accessToken;
      const u = session.user as {
        sub?: string;
        email?: string;
        name?: string;
        picture?: string;
      };

      if (!u?.email) {
        toast.error("10 Minute School did not return an email for this account.");
        return;
      }

      // Bridge to Supabase: server verifies the access token, then upserts the
      // auth user and returns a magiclink token_hash for verifyOtp.
      const { data, error } = await supabase.functions.invoke(
        "tenms-auth-bridge",
        {
          body: {
            accessToken,
            profile: {
              sub: u.sub,
              email: u.email,
              name: u.name,
              picture: u.picture,
            },
          },
        },
      );
      if (error || !data?.token_hash) {
        console.error("[10ms] bridge failed", error, data);
        toast.error(
          (data as { error?: string } | undefined)?.error ??
            error?.message ??
            "10 Minute School sign-in failed",
        );
        return;
      }
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: data.token_hash,
      });
      if (verifyErr) {
        console.error("[10ms] verifyOtp failed", verifyErr);
        toast.error(verifyErr.message);
        return;
      }
      toast.success("Signed in with 10 Minute School");
      // App.tsx onAuthStateChange listener handles the redirect.
    } catch (e) {
      console.error("[10ms] sign-in error", e);
      toast.error("Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (busy) {
    return (
      <button
        type="button"
        disabled
        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium text-muted-foreground"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Signing in with 10 Minute School…
      </button>
    );
  }

  return (
    <div className="mt-2 w-full [&>*]:w-full [&_button]:w-full">
      <LoginButton
        clientId={TENMS_CLIENT_ID}
        text="Sign in with 10 Minute School"
        theme="dark"
        size="medium"
        onSuccess={handleSuccess}
        onError={(err) => {
          console.error("[10ms] login error", err);
          if (err?.message && !/popup_closed/i.test(err.message)) {
            toast.error(err.message);
          }
        }}
      />
      {disabled ? null : null}
    </div>
  );
}

export default TenMSLoginButton;
