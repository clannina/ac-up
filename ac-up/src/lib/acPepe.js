import { supabase } from "../supabaseClient";

// ============================================
// RESPIRI
// ============================================

export async function getRespiri(limite = 200) {
  const { data, error } = await supabase
    .from("ac_pepe_respiri")
    .select("*")
    .order("data", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return data ?? [];
}

export async function getUltimoRespiro() {
  const { data, error } = await supabase
    .from("ac_pepe_respiri")
    .select("*")
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function creaRespiro({ bpm, durata_secondi, conteggio_respiri, nota }) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("ac_pepe_respiri").insert({
    profile_id: userData.user.id,
    bpm,
    durata_secondi,
    conteggio_respiri,
    nota: nota || null,
  });
  if (error) throw error;
}

export async function eliminaRespiro(id) {
  const { error } = await supabase.from("ac_pepe_respiri").delete().eq("id", id);
  if (error) throw error;
}

// Stato/colore in base alle soglie indicate dal veterinario:
// 20-30 buono, 30-36 da monitorare, oltre 36 urgente.
export function statoRespiro(bpm) {
  if (bpm <= 30) return { livello: "buono", colore: "#7ed9a8", label: "Nella norma" };
  if (bpm <= 36) return { livello: "attenzione", colore: "#ffcf5c", label: "Da monitorare" };
  return { livello: "allarme", colore: "#e05252", label: "Contatta il veterinario" };
}

// ============================================
// TERAPIE
// ============================================

export async function getTerapie(soloAttive = true) {
  let query = supabase.from("ac_pepe_terapie").select("*").order("orario", { ascending: true });
  if (soloAttive) query = query.eq("attiva", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function creaTerapia({ nome, dose, orario, note }) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("ac_pepe_terapie").insert({
    profile_id: userData.user.id,
    nome,
    dose,
    orario,
    note: note || null,
  });
  if (error) throw error;
}

export async function aggiornaTerapia(id, payload) {
  const { error } = await supabase.from("ac_pepe_terapie").update(payload).eq("id", id);
  if (error) throw error;
}

export async function toggleTerapiaAttiva(id, attiva) {
  const { error } = await supabase.from("ac_pepe_terapie").update({ attiva }).eq("id", id);
  if (error) throw error;
}

export async function eliminaTerapia(id) {
  const { error } = await supabase.from("ac_pepe_terapie").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// SOMMINISTRAZIONI (checklist giornaliera)
// ============================================

export async function getSomministrazioniData(data) {
  const { data: righe, error } = await supabase
    .from("ac_pepe_somministrazioni")
    .select("*")
    .eq("data", data);
  if (error) throw error;
  return righe ?? [];
}

export async function segnaSomministrazione(terapia_id, data, fatto) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("ac_pepe_somministrazioni")
    .upsert(
      {
        profile_id: userData.user.id,
        terapia_id,
        data,
        fatto,
        ora_somministrazione: fatto ? new Date().toISOString() : null,
      },
      { onConflict: "terapia_id,data" }
    );
  if (error) throw error;
}

// ============================================
// SCADENZE
// ============================================

export async function getScadenze() {
  const { data, error } = await supabase
    .from("ac_pepe_scadenze")
    .select("*")
    .order("data_scadenza", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function creaScadenza({ titolo, data_scadenza, ricorrenza, note }) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("ac_pepe_scadenze").insert({
    profile_id: userData.user.id,
    titolo,
    data_scadenza,
    ricorrenza: ricorrenza || "una_tantum",
    note: note || null,
  });
  if (error) throw error;
}

export async function aggiornaScadenza(id, payload) {
  const { error } = await supabase.from("ac_pepe_scadenze").update(payload).eq("id", id);
  if (error) throw error;
}

export async function eliminaScadenza(id) {
  const { error } = await supabase.from("ac_pepe_scadenze").delete().eq("id", id);
  if (error) throw error;
}
