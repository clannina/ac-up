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

export async function creaSpesa({ categoria_id, importo, data, nota, foto_url }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data: spesa, error } = await supabase
    .from("ac_home_spese")
    .insert({ categoria_id, importo, data, nota, foto_url, user_id: userData.user.id })
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
// Salva sotto ac-home-scontrini/<user_id>/<timestamp>-<nomefile>, come richiesto dalla policy dello storage.
export async function caricaFotoScontrino(file) {
  const { data: userData } = await supabase.auth.getUser();
  const path = `${userData.user.id}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("ac-home-scontrini").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("ac-home-scontrini").getPublicUrl(path);
  // Il bucket e' privato: questo url va usato solo per generare, quando serve visualizzarla,
  // una signed url a parte (vedi getUrlFotoScontrino).
  return path;
}

export async function getUrlFotoScontrino(path) {
  const { data, error } = await supabase.storage
    .from("ac-home-scontrini")
    .createSignedUrl(path, 60 * 60); // valida 1 ora
  if (error) throw error;
  return data.signedUrl;
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
  // upsert manuale: se esiste gia' un budget per quella categoria/mese/anno, lo aggiorna
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
