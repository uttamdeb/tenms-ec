import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MetabaseDashboard = () => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmbedUrl = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-metabase-token');
      
      if (error) {
        console.error('Error fetching embed URL:', error);
        throw new Error(error.message || 'Failed to generate dashboard URL');
      }
      
      if (data?.iframeUrl) {
        setIframeUrl(data.iframeUrl);
      } else {
        throw new Error('No URL received from server');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmbedUrl();
    
    // Refresh token every 8 minutes (before 10 min expiry)
    const refreshInterval = setInterval(fetchEmbedUrl, 8 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchEmbedUrl]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Failed to Load Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchEmbedUrl} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-background">
      <iframe
        src={iframeUrl || ''}
        className="w-full h-full border-0"
        title="10 Minute School Dashboard"
        allowFullScreen
        style={{ minHeight: 'calc(100vh - 140px)' }}
      />
    </div>
  );
};

export default MetabaseDashboard;
