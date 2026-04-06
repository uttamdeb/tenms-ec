import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, LogOut, Palette, Sun, Moon, Check } from "lucide-react";
import ProfileSettings from "./ProfileSettings";
import type { Profile } from "@/hooks/useProfile";
import { useAccentColor, ACCENT_OPTIONS } from "@/hooks/useAccentColor";
import { runWithViewTransition } from "@/lib/viewTransitions";
import { cn } from "@/lib/utils";

interface ProfileDropdownProps {
  profile: Profile;
  onUpdateProfile: (updates: { full_name?: string; role?: string }) => Promise<boolean>;
  onUploadAvatar: (file: File) => Promise<string | null>;
}

const ProfileDropdown = ({ profile, onUpdateProfile, onUploadAvatar }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { accentId, setAccent } = useAccentColor();

  const initials = (profile.full_name || profile.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      runWithViewTransition(() => navigate("/auth"));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-transform duration-200 hover:scale-105 active:scale-95">
            <Avatar className="h-10 w-10 cursor-pointer border border-white/10 transition-all duration-300 hover:shadow-md">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-panel w-56 rounded-[1.5rem] p-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="px-2 py-1.5 transition-colors duration-300">
            <p className="text-sm font-medium truncate">{profile.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setThemeOpen(true)} className="cursor-pointer">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-destructive/10">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        onUploadAvatar={onUploadAvatar}
      />

      <Dialog open={themeOpen} onOpenChange={setThemeOpen}>
        <DialogContent className="glass-panel border-0 rounded-[1.75rem] sm:max-w-sm p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="headline-agent text-2xl">Theme</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 px-6 pb-6">
            <div className="space-y-2">
              <p className="label-tech">MODE</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => runWithViewTransition(() => setTheme("light"))}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    theme === "light" ? "bg-primary/15 text-primary ring-1 ring-primary/40" : "surface-card hover:bg-white/5"
                  )}
                >
                  <Sun className="h-4 w-4" />
                  Light
                  {theme === "light" && <Check className="ml-auto h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => runWithViewTransition(() => setTheme("dark"))}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    theme === "dark" ? "bg-primary/15 text-primary ring-1 ring-primary/40" : "surface-card hover:bg-white/5"
                  )}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                  {theme === "dark" && <Check className="ml-auto h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="label-tech">ACCENT COLOR</p>
              <div className="flex items-center gap-3">
                {ACCENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAccent(opt.id)}
                    title={opt.name}
                    aria-label={`${opt.name} accent`}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110",
                      accentId === opt.id ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "ring-1 ring-border/40"
                    )}
                    style={{ backgroundColor: opt.swatch }}
                  >
                    {accentId === opt.id && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDropdown;
