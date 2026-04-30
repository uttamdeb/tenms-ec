import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TENMS_CLIENT_ID = "tenms_e597013ee371f84e95b395715107b4fd";

interface TenMSGlobal {
  LoginButton?: React.ComponentType<TenMSLoginButtonProps>;
  TenMSAuth?: new (config: {
    clientId: string;
    redirectUri: string;
  }) => {
    exchangeCode: (
      code: string,
      verifier: string,
    ) => Promise<{ access_token: string }>;
    getUserInfo: (token: string) => Promise<unknown>;
  };
}

interface TenMSLoginButtonProps {
  clientId: string;
  redirectUri: string;
  text?: string;
  theme?: "light" | "dark";
  onSuccess?: (detail: { code: string; codeVerifier: string }) => void | Promise<void>;
  onError?: (err: Error) => void;
}

declare global {
  interface Window {
    TenMSAuth?: TenMSGlobal;
  }
}

export function TenMSLoginButton({ disabled }: { disabled?: boolean }) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.TenMSAuth?.LoginButton) {
      setReady(true);
      return;
    }
    const handler = () => {
      if (window.TenMSAuth?.LoginButton) setReady(true);
    };
    window.addEventListener("tenms-auth-ready", handler);
    // Poll briefly in case the script loaded before the listener attached.
    const interval = window.setInterval(() => {
      if (window.TenMSAuth?.LoginButton) {
        setReady(true);
        window.clearInterval(interval);
      }
    }, 250);
    return () => {
      window.removeEventListener("tenms-auth-ready", handler);
      window.clearInterval(interval);
    };
  }, []);

  const redirectUri =
    typeof window !== "undefined" ? window.location.origin : "";

  const handleSuccess = async ({
    code,
    codeVerifier,
  }: {
    code: string;
    codeVerifier: string;
  }) => {
    setBusy(true);
    try {
      // Bridge: exchange the 10MS code for a Supabase session.
      const { data, error } = await supabase.functions.invoke(
        "tenms-auth-bridge",
        {
          body: {
            code,
            codeVerifier,
            clientId: TENMS_CLIENT_ID,
            redirectUri,
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
      // App.tsx onAuthStateChange listener will redirect.
    } catch (e) {
      console.error("[10ms] sign-in error", e);
      toast.error("Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium text-muted-foreground opacity-70"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading 10 Minute School…
      </button>
    );
  }

  const LoginButton = window.TenMSAuth!.LoginButton!;

  return (
    <div className="mt-2 w-full [&>*]:w-full">
      {busy ? (
        <button
          type="button"
          disabled
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in with 10 Minute School…
        </button>
      ) : (
        <LoginButton
          clientId={TENMS_CLIENT_ID}
          redirectUri={redirectUri}
          text="Sign in with 10 Minute School"
          theme="dark"
          onSuccess={handleSuccess}
          onError={(err) => {
            console.error("[10ms] login error", err);
            if (err?.message && !/popup_closed/i.test(err.message)) {
              toast.error(err.message);
            }
          }}
        />
      )}
      {disabled ? null : null}
    </div>
  );
}

export default TenMSLoginButton;
