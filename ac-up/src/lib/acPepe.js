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

export async function creaTerapia({ nome, dose, orari, note, ricettaFile }) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user.id;

  let ricetta_url = null;
  let ricetta_percorso = null;
  if (ricettaFile) {
    const caricata = await caricaFileRicetta(userId, ricettaFile);
    ricetta_url = caricata.url;
    ricetta_percorso = caricata.percorso;
  }

  const { error } = await supabase.from("ac_pepe_terapie").insert({
    profile_id: userId,
    nome,
    dose,
    orari: orari && orari.length > 0 ? orari : [],
    note: note || null,
    ricetta_url,
    ricetta_percorso,
  });
  if (error) throw error;
}

// Carica un file di ricetta nello stesso bucket usato per i referti.
async function caricaFileRicetta(userId, file) {
  const estensione = file.name.split(".").pop();
  const percorso = `${userId}/ricette/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${estensione}`;

  const { error: uploadError } = await supabase.storage
    .from("ac-pepe-referti")
    .upload(percorso, file);
  if (uploadError) throw uploadError;

  const { data: pubUrl } = supabase.storage.from("ac-pepe-referti").getPublicUrl(percorso);
  return { url: pubUrl.publicUrl, percorso };
}

// Aggiunge o sostituisce la ricetta allegata a una terapia già esistente.
export async function caricaRicettaTerapia(terapiaId, file) {
  const { data: userData } = await supabase.auth.getUser();
  const { url, percorso } = await caricaFileRicetta(userData.user.id, file);
  const { error } = await supabase
    .from("ac_pepe_terapie")
    .update({ ricetta_url: url, ricetta_percorso: percorso })
    .eq("id", terapiaId);
  if (error) throw error;
}

export async function rimuoviRicettaTerapia(terapiaId, ricettaPercorso) {
  if (ricettaPercorso) {
    await supabase.storage.from("ac-pepe-referti").remove([ricettaPercorso]);
  }
  const { error } = await supabase
    .from("ac_pepe_terapie")
    .update({ ricetta_url: null, ricetta_percorso: null })
    .eq("id", terapiaId);
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

export async function segnaSomministrazione(terapia_id, data, orario, fatto) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("ac_pepe_somministrazioni")
    .upsert(
      {
        profile_id: userData.user.id,
        terapia_id,
        data,
        orario: orario || "",
        fatto,
        ora_somministrazione: fatto ? new Date().toISOString() : null,
      },
      { onConflict: "terapia_id,data,orario" }
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

// ============================================
// PESO
// ============================================

export async function getPeso(limite = 200) {
  const { data, error } = await supabase
    .from("ac_pepe_peso")
    .select("*")
    .order("data", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return data ?? [];
}

export async function getUltimoPeso() {
  const { data, error } = await supabase
    .from("ac_pepe_peso")
    .select("*")
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function creaPeso({ peso_kg, nota, data }) {
  const { data: userData } = await supabase.auth.getUser();
  const payload = {
    profile_id: userData.user.id,
    peso_kg,
    nota: nota || null,
  };
  if (data) payload.data = data;
  const { error } = await supabase.from("ac_pepe_peso").insert(payload);
  if (error) throw error;
}

export async function eliminaPeso(id) {
  const { error } = await supabase.from("ac_pepe_peso").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// REFERTI (documenti/allegati)
// ============================================

export async function getReferti() {
  const { data, error } = await supabase
    .from("ac_pepe_referti")
    .select("*")
    .order("data", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Carica il file su Storage e poi salva la riga con il link pubblico.
export async function creaReferto({ titolo, tipo, data, note, file }) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user.id;

  const estensione = file.name.split(".").pop();
  const percorso = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${estensione}`;

  const { error: uploadError } = await supabase.storage
    .from("ac-pepe-referti")
    .upload(percorso, file);
  if (uploadError) throw uploadError;

  const { data: pubUrl } = supabase.storage.from("ac-pepe-referti").getPublicUrl(percorso);

  const { error } = await supabase.from("ac_pepe_referti").insert({
    profile_id: userId,
    titolo,
    tipo: tipo || "altro",
    data,
    file_url: pubUrl.publicUrl,
    file_nome: file.name,
    file_percorso: percorso,
    note: note || null,
  });
  if (error) throw error;
}

export async function eliminaReferto(id, filePercorso) {
  if (filePercorso) {
    await supabase.storage.from("ac-pepe-referti").remove([filePercorso]);
  }
  const { error } = await supabase.from("ac_pepe_referti").delete().eq("id", id);
  if (error) throw error;
}

// Aggiorna i dati di un referto già esistente. Se viene passato un nuovo file,
// sostituisce anche l'allegato (rimuovendo il vecchio da Storage).
export async function aggiornaReferto(id, { titolo, tipo, data, note, file, vecchioPercorso }) {
  const payload = { titolo, tipo: tipo || "altro", data, note: note || null };

  if (file) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user.id;
    const estensione = file.name.split(".").pop();
    const percorso = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${estensione}`;

    const { error: uploadError } = await supabase.storage.from("ac-pepe-referti").upload(percorso, file);
    if (uploadError) throw uploadError;

    const { data: pubUrl } = supabase.storage.from("ac-pepe-referti").getPublicUrl(percorso);
    payload.file_url = pubUrl.publicUrl;
    payload.file_nome = file.name;
    payload.file_percorso = percorso;

    if (vecchioPercorso) {
      await supabase.storage.from("ac-pepe-referti").remove([vecchioPercorso]);
    }
  }

  const { error } = await supabase.from("ac_pepe_referti").update(payload).eq("id", id);
  if (error) throw error;
}

// ============================================
// ADDOME (circonferenza + liquido, monitoraggio ascite)
// ============================================

export async function getAddome(limite = 200) {
  const { data, error } = await supabase
    .from("ac_pepe_addome")
    .select("*")
    .order("data", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return data ?? [];
}

export async function getUltimoAddome() {
  const { data, error } = await supabase
    .from("ac_pepe_addome")
    .select("*")
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function creaAddome({ circonferenza_cm, liquido_ml, nota }) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("ac_pepe_addome").insert({
    profile_id: userData.user.id,
    circonferenza_cm,
    liquido_ml: liquido_ml || null,
    nota: nota || null,
  });
  if (error) throw error;
}

export async function eliminaAddome(id) {
  const { error } = await supabase.from("ac_pepe_addome").delete().eq("id", id);
  if (error) throw error;
}

// Variante senza upload: salva solo un link esterno (es. Google Drive condiviso).
export async function creaRefertoLink({ titolo, tipo, data, note, link }) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("ac_pepe_referti").insert({
    profile_id: userData.user.id,
    titolo,
    tipo: tipo || "altro",
    data,
    file_url: link,
    file_nome: null,
    file_percorso: null,
    note: note || null,
  });
  if (error) throw error;
}
