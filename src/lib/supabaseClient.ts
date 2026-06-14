import { createClient } from "@supabase/supabase-js";

// .trim() defensivo: evita que un espacio o salto de línea accidental al pegar
// las variables (p. ej. en el panel de Railway) invalide la llave.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

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
