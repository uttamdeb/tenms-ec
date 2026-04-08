import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { useProfile } from "@/hooks/useProfile";
import tentenIcon from "@/assets/tenten-icon.png";

const Header = () => {
  const { profile, updateProfile, uploadAvatar } = useProfile();

  return (
    <header className="surface-shell relative z-20 px-3 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <img src={tentenIcon} alt="10MS Data Agent" className="h-10 w-10 shrink-0 rounded-xl object-contain" />
          <div className="min-w-0 flex-1">
            <p className="headline-agent truncate text-[1.05rem] leading-[1.05] sm:text-2xl">10MS Data Agent</p>
            <p className="label-tech mt-1 hidden sm:block">A 10MS ORIGINLABS INITIATIVE | HIGHLY CONFIDENTIAL</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
