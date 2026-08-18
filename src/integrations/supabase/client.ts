import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://uknpkoxwuygwztonlyrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbnBrb3h3dXlnd3p0b25seXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0Njg2MjIsImV4cCI6MjEwMDA0NDYyMn0.RD3w2FPGKHj8ZVbvs2us9W68Hc0oOcVo_FQGYbd1Uyc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
