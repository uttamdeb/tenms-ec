import { useEffect, useState, useCallback } from "react";

export interface AccentOption {
  id: string;
  name: string;
  /** HSL values for --primary in light and dark modes */
  light: { primary: string; primaryForeground: string; ring: string; accent: string; accentForeground: string };
  dark: { primary: string; primaryForeground: string; ring: string; accent: string; accentForeground: string };
  /** Preview swatch color (hex) */
  swatch: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: "amber",
    name: "Amber",
    light: { primary: "43 96% 56%", primaryForeground: "38 100% 18%", ring: "43 96% 56%", accent: "44 70% 88%", accentForeground: "24 10% 12%" },
    dark: { primary: "43 96% 56%", primaryForeground: "38 100% 14%", ring: "43 96% 56%", accent: "60 2% 14%", accentForeground: "43 96% 56%" },
    swatch: "#FBBF24",
  },
  {
    id: "blue",
    name: "Blue",
    light: { primary: "217 91% 60%", primaryForeground: "0 0% 100%", ring: "217 91% 60%", accent: "214 70% 92%", accentForeground: "215 25% 20%" },
    dark: { primary: "217 91% 60%", primaryForeground: "0 0% 100%", ring: "217 91% 60%", accent: "217 20% 16%", accentForeground: "217 91% 60%" },
    swatch: "#3B82F6",
  },
  {
    id: "emerald",
    name: "Emerald",
    light: { primary: "160 84% 39%", primaryForeground: "0 0% 100%", ring: "160 84% 39%", accent: "158 60% 90%", accentForeground: "160 30% 15%" },
    dark: { primary: "160 84% 39%", primaryForeground: "0 0% 100%", ring: "160 84% 39%", accent: "160 15% 14%", accentForeground: "160 84% 39%" },
    swatch: "#10B981",
  },
  {
    id: "rose",
    name: "Rose",
    light: { primary: "347 77% 50%", primaryForeground: "0 0% 100%", ring: "347 77% 50%", accent: "347 50% 92%", accentForeground: "347 30% 18%" },
    dark: { primary: "347 77% 55%", primaryForeground: "0 0% 100%", ring: "347 77% 55%", accent: "347 15% 14%", accentForeground: "347 77% 55%" },
    swatch: "#E11D48",
  },
  {
    id: "violet",
    name: "Violet",
    light: { primary: "263 70% 58%", primaryForeground: "0 0% 100%", ring: "263 70% 58%", accent: "263 50% 92%", accentForeground: "263 30% 18%" },
    dark: { primary: "263 70% 58%", primaryForeground: "0 0% 100%", ring: "263 70% 58%", accent: "263 15% 14%", accentForeground: "263 70% 58%" },
    swatch: "#7C3AED",
  },
];

const STORAGE_KEY = "ec-agent-accent";

function applyAccent(option: AccentOption, isDark: boolean) {
  const root = document.documentElement;
  const vars = isDark ? option.dark : option.light;
  root.style.setProperty("--primary", vars.primary);
  root.style.setProperty("--primary-foreground", vars.primaryForeground);
  root.style.setProperty("--ring", vars.ring);
  root.style.setProperty("--accent-foreground", vars.accentForeground);
  root.style.setProperty("--sidebar-primary", vars.primary);
  root.style.setProperty("--sidebar-primary-foreground", vars.primaryForeground);
  root.style.setProperty("--sidebar-ring", vars.ring);
  root.style.setProperty("--chart-1", vars.primary);
}

export function useAccentColor() {
  const [accentId, setAccentId] = useState<string>(() => {
    try { return localStorage.getItem(STORAGE_KEY) || "amber"; } catch { return "amber"; }
  });

  const currentAccent = ACCENT_OPTIONS.find((o) => o.id === accentId) || ACCENT_OPTIONS[0];

  // Apply on mount and when accent or theme changes
  useEffect(() => {
    const apply = () => {
      const isDark = document.documentElement.classList.contains("dark");
      applyAccent(currentAccent, isDark);
    };
    apply();

    // Watch for theme class changes (dark ↔ light)
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [currentAccent]);

  const setAccent = useCallback((id: string) => {
    setAccentId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
  }, []);

  return { accentId, setAccent, currentAccent, options: ACCENT_OPTIONS };
}
