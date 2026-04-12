import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SuggestedMessagesProps {
  mode: "ec" | "10ms";
  onSelect: (message: string) => void;
}

const SuggestedMessages = ({ mode, onSelect }: SuggestedMessagesProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setSuggestions([]);

      const { data, error } = await supabase
        .from("suggested_messages")
        .select("message")
        .eq("mode", mode);

      if (error || !data) return;

      // Pick 3 random suggestions
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setSuggestions(shuffled.slice(0, 3).map((d) => d.message));
    };

    fetchSuggestions();
  }, [mode]);

  if (suggestions.length === 0) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
      {suggestions.map((msg) => (
        <button
          key={msg}
          onClick={() => onSelect(msg)}
          className="glass-hover surface-card w-full rounded-[1.35rem] px-4 py-3 text-left text-sm text-[hsl(var(--on-surface-variant))] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground sm:w-auto sm:max-w-[22rem]"
        >
          {msg}
        </button>
      ))}
    </div>
  );
};

export default SuggestedMessages;
