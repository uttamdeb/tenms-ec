import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MetabaseDashboard from "@/components/dashboard/MetabaseDashboard";
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
          <MetabaseDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
