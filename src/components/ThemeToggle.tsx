import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { runWithViewTransition } from "@/lib/viewTransitions";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-11 w-11 rounded-full bg-card/70 sm:h-10 sm:w-10 sm:rounded-md">
        <Sun className="h-[1.3rem] w-[1.3rem] sm:h-[1.2rem] sm:w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() =>
        runWithViewTransition(() => setTheme(theme === "dark" ? "light" : "dark"))
      }
      className="h-11 w-11 rounded-full bg-card/70 transition-smooth sm:h-10 sm:w-10 sm:rounded-md"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-smooth sm:h-[1.2rem] sm:w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.3rem] w-[1.3rem] rotate-90 scale-100 transition-smooth sm:h-[1.2rem] sm:w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
