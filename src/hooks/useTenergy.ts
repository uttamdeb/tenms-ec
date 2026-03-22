import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const DAILY_CHAR_LIMIT = 100_000;

function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function useTenergy() {
  const [charactersUsed, setCharactersUsed] = useState(0);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load user role + today's usage
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "BI") {
        setIsUnlimited(true);
      }

      // Fetch today's usage
      const today = getTodayDate();
      const { data: usage } = await supabase
        .from("daily_usage")
        .select("characters_used")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .single();

      if (usage) {
        setCharactersUsed(usage.characters_used);
      }
      setLoaded(true);
    };

    init();
  }, []);

  // Add characters used (call after each message exchange)
  const addUsage = useCallback(async (chars: number) => {
    if (!userId || isUnlimited) return;
    const today = getTodayDate();
    const newTotal = charactersUsed + chars;

    // Upsert: insert or update today's row
    const { error } = await supabase
      .from("daily_usage")
      .upsert(
        { user_id: userId, usage_date: today, characters_used: newTotal },
        { onConflict: "user_id,usage_date" }
      );

    if (!error) {
      setCharactersUsed(newTotal);
    }
  }, [userId, isUnlimited, charactersUsed]);

  // Refresh usage from DB
  const refresh = useCallback(async () => {
    if (!userId) return;
    const today = getTodayDate();
    const { data } = await supabase
      .from("daily_usage")
      .select("characters_used")
      .eq("user_id", userId)
      .eq("usage_date", today)
      .single();

    if (data) {
      setCharactersUsed(data.characters_used);
    }
  }, [userId]);

  const remaining = Math.max(0, DAILY_CHAR_LIMIT - charactersUsed);
  const tenergy = Math.floor(remaining / 100);
  const hasEnoughTenergy = isUnlimited || remaining > 0;

  return {
    tenergy,
    remaining,
    isUnlimited,
    hasEnoughTenergy,
    charactersUsed,
    loaded,
    addUsage,
    refresh,
    DAILY_CHAR_LIMIT,
  };
}
