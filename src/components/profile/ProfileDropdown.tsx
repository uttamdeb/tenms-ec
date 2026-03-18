import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import ProfileSettings from "./ProfileSettings";
import type { Profile } from "@/hooks/useProfile";
import { runWithViewTransition } from "@/lib/viewTransitions";

interface ProfileDropdownProps {
  profile: Profile;
  onUpdateProfile: (updates: { full_name?: string; role?: string }) => Promise<boolean>;
  onUploadAvatar: (file: File) => Promise<string | null>;
}

const ProfileDropdown = ({ profile, onUpdateProfile, onUploadAvatar }: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
          <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-transform duration-200 hover:scale-110 active:scale-95">
            <Avatar className="h-8 w-8 cursor-pointer transition-all duration-300 hover:shadow-md">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="px-2 py-1.5 transition-colors duration-300">
            <p className="text-sm font-medium truncate">{profile.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
          <DropdownMenuSeparator className="transition-colors duration-300" />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="transition-colors duration-200 hover:bg-accent/50 cursor-pointer">
            <Settings className="h-4 w-4 mr-2 transition-transform duration-200" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="transition-colors duration-300" />
          <DropdownMenuItem onClick={handleLogout} className="transition-colors duration-200 hover:bg-destructive/10 cursor-pointer">
            <LogOut className="h-4 w-4 mr-2 transition-transform duration-200" />
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
    </>
  );
};

export default ProfileDropdown;
