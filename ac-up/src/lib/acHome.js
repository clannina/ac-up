import { supabase } from "../supabaseClient";

// --- Categorie ---
// gruppo: 'casa' | 'auto' | 'scooter'
export async function getCategorie(gruppo) {
  let query = supabase.from("ac_home_categorie").select("*").order("nome");
  if (gruppo) query = query.eq("gruppo", gruppo);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function creaCategoria(gruppo, nome) {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("ac_home_categorie")
    .insert({ gruppo, nome, user_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Spese ---
export async function getSpese({ mese, anno, gruppo } = {}) {
  let query = supabase
    .from("ac_home_spese")
    .select("*, ac_home_categorie(nome, gruppo)")
    .order("data", { ascending: false });

  if (mese && anno) {
    const inizio = `${anno}-${String(mese).padStart(2, "0")}-01`;
    const fine = `${anno}-${String(mese).padStart(2, "0")}-31`;
    query = query.gte("data", inizio).lte("data", fine);
  }
  const { data, error } = await query;
  if (error) throw error;
  return gruppo ? data.filter((s) => s.ac_home_categorie?.gruppo === gruppo) : data;
}

export async function creaSpesa({ categoria_id, importo, data, nota, foto_url, ricorrente_id }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data: spesa, error } = await supabase
    .from("ac_home_spese")
    .insert({ categoria_id, importo, data, nota, foto_url, ricorrente_id: ricorrente_id || null, user_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return spesa;
}

export async function eliminaSpesa(id) {
  const { error } = await supabase.from("ac_home_spese").delete().eq("id", id);
  if (error) throw error;
}

// --- Upload foto scontrino ---
export async function caricaFotoScontrino(file) {
  const { data: userData } = await supabase.auth.getUser();
  const path = `${userData.user.id}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("ac-home-scontrini").upload(path, file);
  if (error) throw error;
  return path;
}

export async function getUrlFotoScontrino(path) {
  const { data, error } = await supabase.storage
    .from("ac-home-scontrini")
    .createSignedUrl(path, 60 * 60); // valida 1 ora
  if (error) throw error;
  return data.signedUrl;
}

// Somma di tutte le spese mai registrate per un gruppo (casa/auto/scooter), senza filtro di mese.
export async function getTotaleGenerale(gruppo) {
  const { data, error } = await supabase
    .from("ac_home_spese")
    .select("importo, ac_home_categorie(gruppo)");
  if (error) throw error;
  return data
    .filter((s) => s.ac_home_categorie?.gruppo === gruppo)
    .reduce((tot, s) => tot + Number(s.importo), 0);
}

// --- Budget ---
export async function getBudget(mese, anno) {
  const { data, error } = await supabase
    .from("ac_home_budget")
    .select("*, ac_home_categorie(nome, gruppo)")
    .eq("mese", mese)
    .eq("anno", anno);
  if (error) throw error;
  return data;
}

export async function impostaBudget({ categoria_id, mese, anno, importo }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data: esistente } = await supabase
    .from("ac_home_budget")
    .select("id")
    .eq("categoria_id", categoria_id)
    .eq("mese", mese)
    .eq("anno", anno)
    .maybeSingle();

  if (esistente) {
    const { data, error } = await supabase
      .from("ac_home_budget")
      .update({ importo })
      .eq("id", esistente.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("ac_home_budget")
    .insert({ categoria_id, mese, anno, importo, user_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Spese ricorrenti (mutuo, rate, abbonamenti...) ---
export async function getRicorrenti() {
  const { data, error } = await supabase
    .from("ac_home_ricorrenti")
    .select("*, ac_home_categorie(nome, gruppo)")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function creaRicorrente({ categoria_id, importo, descrizione, giorno_mese, fino_al }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("ac_home_ricorrenti")
    .insert({ categoria_id, importo, descrizione, giorno_mese: giorno_mese || 1, fino_al: fino_al || null, user_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleRicorrente(id, attiva) {
  const { error } = await supabase.from("ac_home_ricorrenti").update({ attiva }).eq("id", id);
  if (error) throw error;
}

export async function eliminaRicorrente(id) {
  const { error } = await supabase.from("ac_home_ricorrenti").delete().eq("id", id);
  if (error) throw error;
}

// --- Veicoli ---
export async function getVeicoli() {
  const { data, error } = await supabase.from("ac_home_veicoli").select("*").order("nome");
  if (error) throw error;
  return data;
}

export async function creaVeicolo({ nome, targa, tipo }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("ac_home_veicoli")
    .insert({ nome, targa, tipo, user_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminaVeicolo(id) {
  const { error } = await supabase.from("ac_home_veicoli").delete().eq("id", id);
  if (error) throw error;
}

// --- Scadenze (es. revisione, assicurazione...) ---
export async function getScadenze() {
  const { data, error } = await supabase
    .from("ac_home_scadenze")
    .select("*, ac_home_categorie(nome, gruppo), ac_home_veicoli(nome, targa, tipo)")
    .order("data_scadenza");
  if (error) throw error;
  return data;
}

export async function creaScadenza({ categoria_id, veicolo_id, titolo, data_scadenza, ricorrenza }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("ac_home_scadenze")
    .insert({
      categoria_id: categoria_id || null,
      veicolo_id: veicolo_id || null,
      titolo,
      data_scadenza,
      ricorrenza: ricorrenza || "una_tantum",
      user_id: userData.user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminaScadenza(id) {
  const { error } = await supabase.from("ac_home_scadenze").delete().eq("id", id);
  if (error) throw error;
}

// --- Notifiche push ---
// Salva (o aggiorna, se lo stesso dispositivo si re-iscrive) l'iscrizione alle notifiche push per l'utente corrente.
export async function salvaPushSubscription(subscription) {
  const { data: userData } = await supabase.auth.getUser();
  const raw = subscription.toJSON();
  const { error } = await supabase.from("ac_home_push_subscriptions").upsert(
    {
      endpoint: raw.endpoint,
      p256dh: raw.keys.p256dh,
      auth: raw.keys.auth,
      user_id: userData.user.id,
    },
    { onConflict: "endpoint" }
  );
  if (error) throw error;
}


// Genera automaticamente, per il mese/anno indicati, le spese derivate dalle ricorrenti attive
// che non sono ancora state create per quel mese (controllo tramite ricorrente_id).
// Va chiamata all'apertura dell'app: se una ricorrente e' gia' stata generata questo mese, non duplica nulla.
export async function generaSpeseRicorrentiDelMese(mese, anno) {
  const ricorrenti = await getRicorrenti();
  const attive = ricorrenti.filter((r) => r.attiva);
  if (attive.length === 0) return;

  // Genera solo le ricorrenti che NON risultano gia' generate per questo mese/anno
  // (controllo sulla ricorrente stessa, cosi' anche se l'utente cancella la spesa generata non viene ricreata),
  // e che non hanno gia' superato la data di fine (es. fine di un finanziamento).
  const inizioMese = new Date(anno, mese - 1, 1);
  const daGenerare = attive.filter((r) => {
    const giaGenerata = r.ultimo_mese_generato === mese && r.ultimo_anno_generato === anno;
    const scaduta = r.fino_al && new Date(r.fino_al) < inizioMese;
    return !giaGenerata && !scaduta;
  });
  if (daGenerare.length === 0) return;

  const ultimoGiorno = new Date(anno, mese, 0).getDate();
  const { data: userData } = await supabase.auth.getUser();

  for (const r of daGenerare) {
    const giorno = Math.min(r.giorno_mese, ultimoGiorno);
    const data = `${anno}-${String(mese).padStart(2, "0")}-${String(giorno).padStart(2, "0")}`;
    await supabase.from("ac_home_spese").insert({
      categoria_id: r.categoria_id,
      importo: r.importo,
      data,
      nota: r.descrizione,
      ricorrente_id: r.id,
      user_id: userData.user.id,
    });
    await supabase
      .from("ac_home_ricorrenti")
      .update({ ultimo_mese_generato: mese, ultimo_anno_generato: anno })
      .eq("id", r.id);
  }
}

// --- Entrate ---
export async function getEntrate(mese, anno) {
  let query = supabase.from("ac_home_entrate").select("*").order("data", { ascending: false });
  if (mese && anno) {
    const inizio = `${anno}-${String(mese).padStart(2, "0")}-01`;
    const fine = `${anno}-${String(mese).padStart(2, "0")}-31`;
    query = query.gte("data", inizio).lte("data", fine);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function creaEntrata({ importo, descrizione, data, entrata_ricorrente_id }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data: entrata, error } = await supabase
    .from("ac_home_entrate")
    .insert({ importo, descrizione, data, entrata_ricorrente_id: entrata_ricorrente_id || null, user_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return entrata;
}

export async function eliminaEntrata(id) {
  const { error } = await supabase.from("ac_home_entrate").delete().eq("id", id);
  if (error) throw error;
}

// --- Entrate ricorrenti (es. stipendio) ---
export async function getEntrateRicorrenti() {
  const { data, error } = await supabase.from("ac_home_entrate_ricorrenti").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function creaEntrataRicorrente({ importo, descrizione, giorno_mese }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("ac_home_entrate_ricorrenti")
    .insert({ importo, descrizione, giorno_mese: giorno_mese || 1, user_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleEntrataRicorrente(id, attiva) {
  const { error } = await supabase.from("ac_home_entrate_ricorrenti").update({ attiva }).eq("id", id);
  if (error) throw error;
}

export async function eliminaEntrataRicorrente(id) {
  const { error } = await supabase.from("ac_home_entrate_ricorrenti").delete().eq("id", id);
  if (error) throw error;
}

// Genera automaticamente, per il mese/anno indicati, le entrate derivate dalle entrate ricorrenti attive
// che non sono ancora state create per quel mese (stessa logica delle spese ricorrenti).
export async function generaEntrateRicorrentiDelMese(mese, anno) {
  const ricorrenti = await getEntrateRicorrenti();
  const attive = ricorrenti.filter((r) => r.attiva);
  if (attive.length === 0) return;

  const daGenerare = attive.filter(
    (r) => !(r.ultimo_mese_generato === mese && r.ultimo_anno_generato === anno)
  );
  if (daGenerare.length === 0) return;

  const ultimoGiorno = new Date(anno, mese, 0).getDate();
  const { data: userData } = await supabase.auth.getUser();

  for (const r of daGenerare) {
    const giorno = Math.min(r.giorno_mese, ultimoGiorno);
    const data = `${anno}-${String(mese).padStart(2, "0")}-${String(giorno).padStart(2, "0")}`;
    await supabase.from("ac_home_entrate").insert({
      importo: r.importo,
      data,
      descrizione: r.descrizione,
      entrata_ricorrente_id: r.id,
      user_id: userData.user.id,
    });
    await supabase
      .from("ac_home_entrate_ricorrenti")
      .update({ ultimo_mese_generato: mese, ultimo_anno_generato: anno })
      .eq("id", r.id);
  }
}
