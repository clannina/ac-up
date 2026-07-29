import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Variabili Supabase mancanti: aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nelle Environment Variables del progetto su Vercel."
  );
} else {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Errore nell'inizializzazione di Supabase:", err);
  }
}

// Se la configurazione manca o non è valida, `supabase` resta `null`.
// Le pagine devono controllarlo prima di usarlo, così un problema di
// configurazione non blocca l'intera app, solo la funzionalità collegata.
export const supabase = client;
