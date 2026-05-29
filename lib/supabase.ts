import { createClient } from "@supabase/supabase-js";

// Public Supabase client — aman dipakai di sisi browser.
// URL & anon key dibaca dari environment variables (NEXT_PUBLIC_*).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Hanya log warning agar build tidak gagal saat env belum diset di lokal CI.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diset. Upload gambar akan gagal sampai variabel ini tersedia."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export const SUPABASE_BUCKET = "cleanova-images";
