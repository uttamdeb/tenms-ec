import { createClient } from '@supabase/supabase-js';

const MIRROR_URL = import.meta.env.VITE_MIRROR_SUPABASE_URL;
const MIRROR_KEY = import.meta.env.VITE_MIRROR_SUPABASE_KEY;

export const mirrorEnabled = !!(MIRROR_URL && MIRROR_KEY);

export const mirror = mirrorEnabled
  ? createClient(MIRROR_URL, MIRROR_KEY)
  : null;
