import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `true` cuando las variables de entorno están presentes. Lo usamos para
 * mostrar un aviso amable en la UI en lugar de tronar la demo si alguien
 * la abre sin configurar Supabase.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;
