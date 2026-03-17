import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: { full_name?: string; role?: string; avatar_url?: string }) => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update profile");
      return false;
    }
    setProfile({ ...profile, ...updates });
    toast.success("Profile updated");
    return true;
  };

  const uploadAvatar = async (file: File) => {
    if (!profile) return null;
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Failed to upload avatar");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    // Add cache-busting param
    const url = `${publicUrl}?t=${Date.now()}`;
    await updateProfile({ avatar_url: url });
    return url;
  };

  return { profile, loading, updateProfile, uploadAvatar, refetch: fetchProfile };
}
