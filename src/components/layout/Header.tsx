import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
      console.error("Logout error:", error);
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  return (
    <header className="w-full bg-card border-b border-border px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src="https://s3.ap-southeast-1.amazonaws.com/cdn.10minuteschool.com/lms10/Screenshot_2025-12-11_at_11%2C20%2C12%C3%A2%C2%80%C2%AFAM_1765430485151.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              10 Minute School
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">English Centre</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
