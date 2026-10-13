import { supabase } from "./supabase";

// Dati della sezione "Soldi in coppia" di AC Home, condivisa tra Anna e Vanna.
// L'accesso reale è controllato dalle policy RLS (tabella ac_coppia_autorizzati).

function check(error) {
  if (error) throw error;
}

export async function getMese(anno, mese) {
  const { data, error } = await supabase
    .from("ac_coppia_mesi")
    .select("*")
    .eq("anno", anno)
    .eq("mese", mese)
    .maybeSingle();
  check(error);
  return data;
}

async function getMesePrecedente(anno, mese) {
  const { data, error } = await supabase
    .from("ac_coppia_mesi")
    .select("*")
    .or(`anno.lt.${anno},and(anno.eq.${anno},mese.lt.${mese})`)
    .order("anno", { ascending: false })
    .order("mese", { ascending: false })
    .limit(1);
  check(error);
  return data?.[0] || null;
}

export async function getVoci(anno, mese) {
  const { data, error } = await supabase
    .from("ac_coppia_voci")
    .select("*")
    .eq("anno", anno)
    .eq("mese", mese)
    .order("ordine", { ascending: true })
    .order("created_at", { ascending: true });
  check(error);
  return data || [];
}

// Apre un mese. Se non esiste ancora lo crea copiando dal mese precedente
// entrate, metodo di divisione, quote, imprevisti e tutte le voci
// (tranne gli abbonamenti segnati "da eliminare"). La checklist riparte vuota.
export async function apriMese(anno, mese) {
  const esistente = await getMese(anno, mese);
  if (esistente) return { mese: esistente, voci: await getVoci(anno, mese) };

  const prec = await getMesePrecedente(anno, mese);
  const nuovo = { anno, mese };
  if (prec) {
    [
      "stipendio_a",
      "stipendio_b",
      "altre_entrate",
      "metodo",
      "quota_a",
      "quota_b",
      "imprevisti_tipo",
      "imprevisti_valore",
    ].forEach((k) => {
      nuovo[k] = prec[k];
    });
  }

  const { data, error } = await supabase.from("ac_coppia_mesi").insert(nuovo).select().single();
  if (error) {
    // Il mese è stato creato nello stesso momento dall'altra persona: lo rileggiamo.
    if (error.code === "23505") {
      return { mese: await getMese(anno, mese), voci: await getVoci(anno, mese) };
    }
    throw error;
  }

  if (prec) {
    const vociPrec = await getVoci(prec.anno, prec.mese);
    const daCopiare = vociPrec
      .filter((v) => !(v.tipo === "abbonamento" && v.da_eliminare))
      .map((v) => ({ anno, mese, tipo: v.tipo, nome: v.nome, importo: v.importo, ordine: v.ordine }));
    if (daCopiare.length > 0) {
      const { error: errVoci } = await supabase.from("ac_coppia_voci").insert(daCopiare);
      check(errVoci);
    }
  }

  return { mese: data, voci: await getVoci(anno, mese) };
}

export async function aggiornaMese(id, campi) {
  const { error } = await supabase
    .from("ac_coppia_mesi")
    .update({ ...campi, updated_at: new Date().toISOString() })
    .eq("id", id);
  check(error);
}

export async function creaVoce(voce) {
  const { data, error } = await supabase.from("ac_coppia_voci").insert(voce).select().single();
  check(error);
  return data;
}

export async function aggiornaVoce(id, campi) {
  const { error } = await supabase.from("ac_coppia_voci").update(campi).eq("id", id);
  check(error);
}

export async function eliminaVoce(id) {
  const { error } = await supabase.from("ac_coppia_voci").delete().eq("id", id);
  check(error);
}
