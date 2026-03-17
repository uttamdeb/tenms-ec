import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import ProfileSettings from "./ProfileSettings";
import type { Profile } from "@/hooks/useProfile";

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
      navigate("/auth");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium truncate">{profile.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
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
    </>
  );
};

export default ProfileDropdown;
