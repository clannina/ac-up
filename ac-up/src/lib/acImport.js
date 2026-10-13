import { supabase } from "../supabaseClient";

// Importazione dell'estratto conto (CSV della banca, separato da ";")
// Colonne attese: DATA CONTABILE;DATA VALUTA;USCITE;ENTRATE;CAUSALE;DESCRIZIONE OPERAZIONE

// ---------- Lettura file ----------

// Legge il file come testo: prova UTF-8, se trova caratteri rotti riprova come Windows-1252.
export function leggiFile(file) {
  const leggi = (enc) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsText(file, enc);
    });
  return leggi("utf-8").then((t) => (t.includes("�") ? leggi("windows-1252") : t));
}

function numeroIt(s) {
  if (!s) return 0;
  const n = Number(String(s).replace(/\s/g, "").replace(/\./g, "").replace(",", ".").replace("+", ""));
  return Number.isFinite(n) ? n : 0;
}

function dataIso(ddmmyyyy) {
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(ddmmyyyy || "");
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

// Piccolo hash per avere una chiave corta e stabile per ogni movimento.
function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

// Ricava un nome leggibile dal testo lungo della banca.
function etichettaDi(causale, desc) {
  const d = desc.replace(/\s+/g, " ").trim();

  const presso = /presso\s+(.+?)(?:\s+-\s+Transazione.*)?$/i.exec(d);
  if (presso) return presso[1].trim();

  if (/^Giroconto/i.test(d)) return "Giroconto";

  const aFavore = /A favore di (.+?) IBAN/i.exec(d);
  const note = /Note:\s*(.+)$/i.exec(d);
  if (aFavore) return note ? `${note[1].trim()} (${aFavore[1].trim()})` : aFavore[1].trim();

  const ordinante = /Anagrafica Ordinante (.+?)(?: Note:|$)/i.exec(d);
  if (ordinante) return note ? `${note[1].trim()} (${ordinante[1].trim()})` : ordinante[1].trim();

  const creditor = /Creditor id\. \S+ (.+?) Id Mandato/i.exec(d);
  if (creditor) {
    const nome = creditor[1].replace(/[(),]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
    const rif = /Rif\. (.+)$/i.exec(d);
    let extra = "";
    if (rif && !/\d{6,}/.test(rif[1])) {
      const pezzi = rif[1].split(" - ");
      extra = pezzi[pezzi.length - 1].trim();
    }
    return extra ? `${nome} · ${extra}` : nome;
  }

  return (d || causale).slice(0, 60);
}

const SUFFISSI = new Set(["SRL", "SAS", "SNC", "SPA", "SRLS", "IT", "S", "A", "DI", "E", "DEL", "DELLA"]);

// Chiave per "imparare": prime 3 parole significative del nome, senza codici e numeri.
export function chiaveDi(etichetta) {
  return etichetta
    .toUpperCase()
    .replace(/[*'.,()\-·/]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/\d/.test(w) && !SUFFISSI.has(w))
    .slice(0, 3)
    .join(" ");
}

export function parseCsv(testo) {
  const righe = testo.split(/\r?\n/).filter((r) => r.trim());
  if (righe.length < 2) return [];
  const intest = righe[0].toUpperCase().split(";").map((s) => s.trim());
  const col = (nome) => intest.findIndex((h) => h.startsWith(nome));
  const iCont = col("DATA CONTABILE");
  const iUsc = col("USCITE");
  const iEnt = col("ENTRATE");
  const iCaus = col("CAUSALE");
  const iDesc = col("DESCRIZIONE");
  if (iCont < 0 || iUsc < 0 || iEnt < 0) throw new Error("Formato del file non riconosciuto.");

  const visti = {};
  const movimenti = [];
  for (const riga of righe.slice(1)) {
    const c = riga.split(";");
    const desc = (c[iDesc] || "").trim();
    const causale = (c[iCaus] || "").trim();
    if (/^Saldo (iniziale|finale)/i.test(desc) && !causale) continue;

    const uscita = numeroIt(c[iUsc]);
    const entrata = numeroIt(c[iEnt]);
    if (!uscita && !entrata) continue;

    // Per i pagamenti con carta la data vera è quella dentro la descrizione ("del 11/07/2026").
    let data = dataIso(c[iCont]);
    if (/Carta/i.test(causale)) {
      const del = / del (\d{2}\/\d{2}\/\d{4})/.exec(desc);
      if (del) data = dataIso(del[1]);
    }

    const tipo = uscita ? "uscita" : "entrata";
    const importo = Math.abs(uscita || entrata);
    const etichetta = etichettaDi(causale, desc);

    // Chiave univoca: stessa riga = stessa chiave anche se reimporti un file sovrapposto.
    let base = `${c[iCont]}|${importo.toFixed(2)}|${desc}`;
    visti[base] = (visti[base] || 0) + 1;
    if (visti[base] > 1) base += `#${visti[base]}`;

    movimenti.push({
      chiaveImport: hash(base),
      data,
      tipo,
      importo,
      causale,
      descrizione: desc,
      etichetta,
      chiave: chiaveDi(etichetta),
    });
  }
  return movimenti;
}

// ---------- Suggerimenti predefiniti (prima che l'app impari) ----------

const PREDEFINITE = [
  { re: /GIROCONTO/, scelta: "salta" },
  { re: /FASTWEB/, cat: "Fastweb" },
  { re: /OCTOPUS.*GAS/, cat: "Octopus GAS" },
  { re: /OCTOPUS.*ENERGIA/, cat: "Octopus ENERGIA" },
  { re: /RATA MUTUO|MUTUO/, cat: "Mutuo" },
  { re: /PERGOLA/, cat: "Pergola" },
  { re: /\bNOW\b|NOWTV/, cat: "NOW" },
  { re: /GOOGLE ?ONE|NETFLIX|SPOTIFY|DISNEY|PRIME VIDEO/, cat: "Abbonamento" },
  { re: /FAMILA|VALDERA MARKET|UNICOOP|\bCOOP\b|IPER |CONAD|ESSELUNGA|LIDL|CARREFOUR|EUROSPIN|PANIFICIO|MACELLERIA|PAM\b/, cat: "Spesa" },
  { re: /CARBURANT|TAMOIL|DISTRIBUTORE|\bENI\b|\bQ8\b|\bESSO\b|IPMATIC|\bAGIP\b/, cat: "Benzina" },
  { re: /FARMACIA|PARAFARMACIA/, cat: "Medicine" },
  { re: /CENTRO ANALISI|ASL|POLIAMBUL|LABORATORIO/, cat: "Prelievi e visite" },
  { re: /ANICURA|VETERINAR|CLINICA VET/, cat: "veterinarie" },
  { re: /ARCAPLANET|ZOOPLUS|ISOLA DEI TESORI|MAXI ZOO/, cat: "Materiali per animali" },
];

export function suggerimentoPredefinito(mov, categorie) {
  // Solo nome e causale: la descrizione lunga contiene parole ("presso"...) che darebbero falsi positivi.
  const testo = `${mov.etichetta} ${mov.causale}`.toUpperCase();
  for (const r of PREDEFINITE) {
    if (!r.re.test(testo)) continue;
    if (r.scelta) return r.scelta;
    if (mov.tipo !== "uscita") continue;
    const cat = categorie.find((c) => c.nome.toLowerCase() === r.cat.toLowerCase());
    if (cat) return `cat:${cat.id}`;
  }
  return mov.tipo === "entrata" ? "entrata" : "";
}

// ---------- Supabase ----------

export async function getRegole() {
  const { data, error } = await supabase.from("ac_home_regole_import").select("chiave, scelta");
  if (error) throw error;
  const mappa = {};
  (data || []).forEach((r) => { mappa[r.chiave] = r.scelta; });
  return mappa;
}

export async function salvaRegole(regole) {
  const righe = Object.entries(regole).map(([chiave, scelta]) => ({ chiave, scelta, updated_at: new Date().toISOString() }));
  if (righe.length === 0) return;
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("ac_home_regole_import")
    .upsert(righe.map((r) => ({ ...r, user_id: userData.user.id })), { onConflict: "user_id,chiave" });
  if (error) throw error;
}

// Restituisce l'insieme delle chiavi già importate (spese + entrate).
export async function getChiaviGiaImportate(chiavi) {
  const trovate = new Set();
  for (let i = 0; i < chiavi.length; i += 100) {
    const blocco = chiavi.slice(i, i + 100);
    const [s, e] = await Promise.all([
      supabase.from("ac_home_spese").select("import_chiave").in("import_chiave", blocco),
      supabase.from("ac_home_entrate").select("import_chiave").in("import_chiave", blocco),
    ]);
    if (s.error) throw s.error;
    if (e.error) throw e.error;
    [...(s.data || []), ...(e.data || [])].forEach((r) => trovate.add(r.import_chiave));
  }
  return trovate;
}

export async function importaMovimenti({ spese, entrate }) {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user.id;

  if (spese.length > 0) {
    const { error } = await supabase.from("ac_home_spese").insert(
      spese.map((m) => ({
        categoria_id: m.categoriaId,
        importo: m.importo,
        data: m.data,
        nota: m.etichetta,
        persona: "Anna",
        condivisa: false,
        rimborsato: false,
        user_id,
        import_chiave: m.chiaveImport,
      }))
    );
    if (error) throw error;
  }

  if (entrate.length > 0) {
    const { error } = await supabase.from("ac_home_entrate").insert(
      entrate.map((m) => ({
        importo: m.importo,
        descrizione: m.etichetta,
        data: m.data,
        persona: "Anna",
        user_id,
        import_chiave: m.chiaveImport,
      }))
    );
    if (error) throw error;
  }
}
