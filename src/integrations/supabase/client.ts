import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Read Supabase config from Vite environment variables. Do NOT commit real keys.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Supabase client may not work in this environment.");
}

export const supabase = createClient<Database>(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "");
