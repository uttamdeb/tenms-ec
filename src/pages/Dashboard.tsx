import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";
import { runWithViewTransition } from "@/lib/viewTransitions";
import tentenIcon from "@/assets/tenten-icon.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        runWithViewTransition(() => navigate("/auth"));
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        runWithViewTransition(() => navigate("/auth"));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="surface-shell min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-2 pb-2 sm:px-4 sm:pb-4">
        <div className="surface-panel h-full overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
          <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col items-center justify-center gap-10 px-6 py-12 text-center sm:px-10 sm:py-16">
            <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.12),transparent_22%),radial-gradient(circle_at_20%_80%,hsl(var(--primary)/0.05),transparent_24%),radial-gradient(circle_at_80%_80%,hsl(var(--primary)/0.04),transparent_24%)]" />
            <div className="relative space-y-5">
              <div className="mx-auto flex h-24 w-24 animate-[float_5s_ease-in-out_infinite] items-center justify-center rounded-[2rem] bg-[hsl(var(--glass-bg))] shadow-[0_24px_80px_-32px_hsl(var(--ambient-glow))] backdrop-blur-xl sm:h-28 sm:w-28">
                <img src={tentenIcon} alt="10MS Data Agent" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
              </div>
              <p className="label-tech uppercase tracking-[0.3em] text-primary">Choose your workspace</p>
              <h1 className="headline-agent text-4xl font-semibold leading-tight sm:text-5xl">
                Welcome to 10MS Data Agent
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[hsl(var(--on-surface-variant))] sm:text-lg">
                Select a mode to begin. Both workspaces share the same AI chat features, but history and suggested prompts are kept separate for EC and 10MS.
              </p>
            </div>
            <div className="relative grid w-full max-w-5xl gap-4 sm:grid-cols-2">
              <button
                onClick={() => runWithViewTransition(() => navigate("/10ms-chat"))}
                className="group glass-panel relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary/20 via-primary/12 to-primary/5 p-6 text-left text-primary transition duration-300 hover:-translate-y-1 hover:from-primary/25 hover:to-primary/10 hover:shadow-[0_32px_90px_-36px_hsl(var(--primary)/0.35)]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(135deg,hsl(var(--primary)/0.18),transparent_55%)]" />
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">10MS (beta)</span>
                  <span className="relative z-10 text-xs uppercase tracking-[0.3em] text-muted-foreground">Online</span>
                </div>
                <h2 className="relative z-10 headline-agent text-2xl font-semibold">10MS Data Workspace</h2>
                <p className="relative z-10 mt-3 text-sm leading-6 text-[hsl(var(--on-surface-variant))]">
                  Explore OB, HSC, SSC, TenTen and online segment analytics with separate chat history and smart suggestions.
                </p>
                <div className="relative z-10 mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                  <span>Start 10MS chat</span>
                  <span aria-hidden="true">→</span>
                </div>
              </button>
              <button
                onClick={() => runWithViewTransition(() => navigate("/ec-chat"))}
                className="group glass-panel relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,hsl(222_70%_12%/.92),hsl(222_70%_10%/.72))] p-6 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_90px_-36px_hsl(222_70%_20%/.45)]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(135deg,hsl(222_70%_30%/.18),transparent_55%)]" />
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="relative z-10 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-slate-100">EC</span>
                  <span className="relative z-10 text-xs uppercase tracking-[0.3em] text-muted-foreground">Branch</span>
                </div>
                <h2 className="relative z-10 headline-agent text-2xl font-semibold text-slate-50">EC Data Workspace</h2>
                <p className="relative z-10 mt-3 text-sm leading-6 text-slate-300">
                  Explore branch-level performance, admissions, attendance, and operational metrics in a dedicated EC chat history.
                </p>
                <div className="relative z-10 mt-6 flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <span>Start EC chat</span>
                  <span aria-hidden="true">→</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
