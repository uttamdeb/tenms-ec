import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { useProfile } from "@/hooks/useProfile";
import { runWithViewTransition } from "@/lib/viewTransitions";
import tentenIcon from "@/assets/tenten-icon.png";

const Header = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, uploadAvatar } = useProfile();

  return (
    <header className="surface-shell relative z-20 px-3 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="cta-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.8)]">
            <img src={tentenIcon} alt="EC Data Agent" className="h-5 w-5 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="headline-agent truncate text-2xl leading-none">EC Data Agent</p>
            <p className="label-tech mt-1 hidden sm:block">Executive command surface</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => runWithViewTransition(() => navigate("/chat"))}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
          <ThemeToggle />
          {profile && (
            <ProfileDropdown
              profile={profile}
              onUpdateProfile={updateProfile}
              onUploadAvatar={uploadAvatar}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
