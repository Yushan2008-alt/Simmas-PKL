import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Supabase client instance untuk query database secara langsung dari client/frontend
 * tanpa melalui Next.js API Routes (sesuai arahan arsitektur SIMMAS).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
