import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";
import { runWithViewTransition } from "@/lib/viewTransitions";

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
          <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col items-center justify-center gap-10 px-6 py-12 text-center sm:px-10 sm:py-16">
            <div className="space-y-4">
              <p className="label-tech uppercase tracking-[0.3em] text-primary">Choose your workspace</p>
              <h1 className="headline-agent text-4xl font-semibold leading-tight sm:text-5xl">
                Welcome to 10MS Data Agent
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[hsl(var(--on-surface-variant))] sm:text-lg">
                Select a mode to begin. Both workspaces share the same AI chat features, but history and suggested prompts are kept separate for EC and 10MS.
              </p>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <button
                onClick={() => runWithViewTransition(() => navigate("/10ms-chat"))}
                className="group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 p-6 text-left text-primary shadow-[0_32px_72px_rgba(251,191,36,0.12)] transition hover:from-primary/25 hover:to-primary/15"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="badge rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">10MS (beta)</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Online</span>
                </div>
                <h2 className="text-2xl font-semibold">10MS Data Workspace</h2>
                <p className="mt-3 text-sm leading-6 text-[hsl(var(--on-surface-variant))]">
                  Explore OB, HSC, SSC, TenTen and online segment analytics with separate chat history and smart suggestions.
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                  <span>Start 10MS chat</span>
                  <span aria-hidden="true">→</span>
                </div>
              </button>
              <button
                onClick={() => runWithViewTransition(() => navigate("/ec-chat"))}
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-700/40 bg-slate-900/50 p-6 text-left transition hover:border-slate-400/40 hover:bg-slate-900/70"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="badge rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-100">EC</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Branch</span>
                </div>
                <h2 className="text-2xl font-semibold">EC Data Workspace</h2>
                <p className="mt-3 text-sm leading-6 text-[hsl(var(--on-surface-variant))]">
                  Explore branch-level performance, admissions, attendance, and operational metrics in a dedicated EC chat history.
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-100">
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
