import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SuggestedMessagesProps {
  onSelect: (message: string) => void;
}

const SuggestedMessages = ({ onSelect }: SuggestedMessagesProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data, error } = await supabase
        .from("suggested_messages")
        .select("message");

      if (error || !data) return;

      // Pick 3 random suggestions
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setSuggestions(shuffled.slice(0, 3).map((d) => d.message));
    };

    fetchSuggestions();
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center px-4 pb-2">
      {suggestions.map((msg) => (
        <button
          key={msg}
          onClick={() => onSelect(msg)}
          className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-accent transition-colors"
        >
          {msg}
        </button>
      ))}
    </div>
  );
};

export default SuggestedMessages;
