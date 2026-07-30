import { supabase } from "../supabaseClient";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Legge quanti bicchieri d'acqua sono già stati registrati oggi.
export async function loadTodayWater(userId) {
  if (!supabase || !userId) return 0;
  const { data } = await supabase
    .from("water_logs")
    .select("glasses")
    .eq("profile_id", userId)
    .eq("log_date", todayISO())
    .maybeSingle();
  return data?.glasses ?? 0;
}

// Scrive il nuovo totale di oggi (una riga sola per giorno, si aggiorna).
export async function saveTodayWater(userId, glasses) {
  if (!supabase || !userId) return;
  await supabase
    .from("water_logs")
    .upsert(
      { profile_id: userId, log_date: todayISO(), glasses },
      { onConflict: "profile_id,log_date" }
    );
}
