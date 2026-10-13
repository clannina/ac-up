import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Upload, Check, AlertTriangle, Sparkles, Plus } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import AcHomeHeader from "../../components/AcHomeHeader.jsx";
import { getCategorie, creaCategoria, getSpese, getEntrate } from "../../lib/acHome";
import {
  leggiFile,
  parseCsv,
  suggerimentoPredefinito,
  getRegole,
  salvaRegole,
  getChiaviGiaImportate,
  importaMovimenti,
} from "../../lib/acImport";

const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";
const BIANCO_SOFT = "rgba(255,255,255,0.75)";
const GRUPPI = [
  { id: "casa", label: "Casa" },
  { id: "auto", label: "Auto" },
  { id: "scooter", label: "Scooter" },
  { id: "mediche", label: "Spese mediche" },
];

function giorniTra(a, b) {
  return Math.abs((new Date(a) - new Date(b)) / 86400000);
}
function dataBreve(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export default function AcHomeImporta() {
  const [categorie, setCategorie] = useState([]);
  const [righe, setRighe] = useState([]);
  const [stato, setStato] = useState("vuoto"); // vuoto | lettura | pronto | importo | fatto
  const [errore, setErrore] = useState("");
  const [esito, setEsito] = useState(null);
  const [mostraGia, setMostraGia] = useState(false);
  // Creazione di una nuova categoria direttamente dal menu a tendina di un movimento
  const [nuovaCatPer, setNuovaCatPer] = useState(null);
  const [nuovaCatNome, setNuovaCatNome] = useState("");
  const [nuovaCatGruppo, setNuovaCatGruppo] = useState("casa");
  const [creandoCat, setCreandoCat] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrore("");
    setEsito(null);
    setStato("lettura");
    try {
      const testo = await leggiFile(file);
      const movimenti = parseCsv(testo);
      if (movimenti.length === 0) throw new Error("Nel file non ho trovato movimenti.");

      const [cats, regole, gia, speseEsistenti, entrateEsistenti] = await Promise.all([
        getCategorie(),
        getRegole(),
        getChiaviGiaImportate(movimenti.map((m) => m.chiaveImport)),
        getSpese({}),
        getEntrate(),
      ]);
      setCategorie(cats);
      const idCategorie = new Set(cats.map((c) => c.id));

      // Movimenti inseriti a mano o generati dalle ricorrenti (es. mutuo): stesso importo, date vicine.
      const manuali = {
        uscita: speseEsistenti.filter((s) => !s.import_chiave),
        entrata: entrateEsistenti.filter((x) => !x.import_chiave),
      };

      const nuove = movimenti
        .map((m) => {
          if (gia.has(m.chiaveImport)) return { ...m, gia: true, scelta: "salta" };

          const simile = manuali[m.tipo].find(
            (x) => Math.abs(Number(x.importo) - m.importo) < 0.01 && giorniTra(x.data, m.data) <= 5
          );
          if (simile) {
            const nome = m.tipo === "uscita" ? simile.ac_home_categorie?.nome || "spesa" : simile.descrizione || "entrata";
            return { ...m, scelta: "salta", motivo: "doppione", doppioneDi: `${nome} del ${dataBreve(simile.data)}` };
          }

          let scelta = regole[m.chiave];
          if (scelta?.startsWith("cat:") && !idCategorie.has(scelta.slice(4))) scelta = undefined;
          if (scelta === "entrata" && m.tipo === "uscita") scelta = undefined;
          if (scelta?.startsWith("cat:") && m.tipo === "entrata") scelta = undefined;
          if (scelta) return { ...m, scelta, motivo: "regola" };

          return { ...m, scelta: suggerimentoPredefinito(m, cats), motivo: "predefinita" };
        })
        .sort((a, b) => (b.data || "").localeCompare(a.data || ""));

      setRighe(nuove);
      setStato("pronto");
    } catch (err) {
      console.error(err);
      setErrore(err.message || "Non riesco a leggere il file.");
      setStato("vuoto");
    } finally {
      e.target.value = "";
    }
  }

  // Cambiando la scelta di un movimento, la applico anche agli altri simili non ancora toccati.
  function cambiaScelta(chiaveImport, scelta) {
    setRighe((prev) => {
      const corrente = prev.find((r) => r.chiaveImport === chiaveImport);
      return prev.map((r) => {
        if (r.chiaveImport === chiaveImport) return { ...r, scelta, toccata: true };
        if (
          corrente &&
          !r.gia &&
          !r.toccata &&
          r.motivo !== "doppione" &&
          r.tipo === corrente.tipo &&
          r.chiave &&
          r.chiave === corrente.chiave
        ) {
          return { ...r, scelta, toccata: true };
        }
        return r;
      });
    });
  }

  function onSelect(r, valore) {
    if (valore === "__nuova") {
      setNuovaCatPer(r.chiaveImport);
      setNuovaCatNome("");
      return;
    }
    if (nuovaCatPer === r.chiaveImport) setNuovaCatPer(null);
    cambiaScelta(r.chiaveImport, valore);
  }

  async function creaNuovaCategoria(chiaveImport) {
    const nome = nuovaCatNome.trim();
    if (!nome) return;
    setCreandoCat(true);
    try {
      const esistente = categorie.find((c) => c.gruppo === nuovaCatGruppo && c.nome.toLowerCase() === nome.toLowerCase());
      const cat = esistente || (await creaCategoria(nuovaCatGruppo, nome));
      if (!esistente) setCategorie((prev) => [...prev, cat].sort((a, b) => a.nome.localeCompare(b.nome)));
      cambiaScelta(chiaveImport, `cat:${cat.id}`);
      setNuovaCatPer(null);
      setNuovaCatNome("");
    } catch (err) {
      console.error(err);
      setErrore("Non sono riuscita a creare la categoria: " + (err.message || ""));
    } finally {
      setCreandoCat(false);
    }
  }

  const riepilogo = useMemo(() => {
    const attive = righe.filter((r) => !r.gia);
    const spese = attive.filter((r) => r.tipo === "uscita" && r.scelta.startsWith("cat:"));
    const entrate = attive.filter((r) => r.tipo === "entrata" && r.scelta === "entrata");
    const daScegliere = attive.filter((r) => r.scelta === "");
    const somma = (l) => l.reduce((t, r) => t + r.importo, 0);
    return {
      spese, entrate, daScegliere,
      totSpese: somma(spese), totEntrate: somma(entrate),
      gia: righe.length - attive.length,
    };
  }, [righe]);

  async function handleImporta() {
    setStato("importo");
    setErrore("");
    try {
      await importaMovimenti({
        spese: riepilogo.spese.map((r) => ({ ...r, categoriaId: r.scelta.slice(4) })),
        entrate: riepilogo.entrate,
      });

      // L'app impara: per ogni nome ricorda l'ultima scelta (tranne i doppioni saltati in automatico).
      const regole = {};
      righe.forEach((r) => {
        if (r.gia || !r.chiave || r.scelta === "") return;
        if (r.scelta === "salta" && !r.toccata) return;
        regole[r.chiave] = r.scelta;
      });
      try { await salvaRegole(regole); } catch (err) { console.error("Regole non salvate:", err); }

      setEsito({ spese: riepilogo.spese.length, entrate: riepilogo.entrate.length });
      setRighe([]);
      setStato("fatto");
    } catch (err) {
      console.error(err);
      setErrore("Errore durante l'importazione: " + (err.message || ""));
      setStato("pronto");
    }
  }

  const visibili = righe.filter((r) => mostraGia || !r.gia);

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <AcHomeHeader />
      <Link to="/ac-home/spese" className="inline-flex items-center gap-1 text-xs mb-2" style={{ color: BIANCO_SOFT }}>
        <ChevronLeft size={14} /> Spese
      </Link>
      <h1 className="font-display text-2xl mb-1" style={{ color: "#fff" }}>Importa estratto conto</h1>
      <p className="text-xs mb-4" style={{ color: BIANCO_SOFT }}>
        Carica il CSV dei movimenti scaricato dalla banca. Controlli le categorie e confermi.
      </p>

      {/* Caricamento file */}
      <label className={`${GLASS} rounded-3xl p-4 mb-4 flex items-center gap-3 cursor-pointer`}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#fff" }}>
          <Upload size={18} color={T.forest} />
        </div>
        <div className="flex-1">
          <p className="font-display text-sm" style={{ color: "#fff" }}>
            {stato === "lettura" ? "Leggo il file..." : righe.length ? "Carica un altro file" : "Scegli il file CSV"}
          </p>
          <p className="text-[11px]" style={{ color: BIANCO_SOFT }}>I movimenti già importati vengono riconosciuti e saltati.</p>
        </div>
        <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFile} className="hidden" />
      </label>

      {errore && (
        <p className="text-sm mb-4 px-3 py-2 rounded-xl" style={{ background: "rgba(224,82,82,0.4)", color: "#fff" }}>{errore}</p>
      )}

      {stato === "fatto" && esito && (
        <div className={`${GLASS} rounded-3xl p-4 mb-4 flex items-center gap-3`}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#fff" }}>
            <Check size={18} color={T.forest} strokeWidth={3} />
          </div>
          <div>
            <p className="font-display text-sm" style={{ color: "#fff" }}>Importazione completata</p>
            <p className="text-xs" style={{ color: BIANCO_SOFT }}>
              {esito.spese} spese e {esito.entrate} entrate salvate.{" "}
              <Link to="/ac-home/spese" className="underline">Vai alle spese</Link>
            </p>
          </div>
        </div>
      )}

      {righe.length > 0 && (
        <>
          {/* Riepilogo */}
          <div className={`${GLASS} rounded-3xl p-4 mb-4`}>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <p className="text-[11px]" style={{ color: BIANCO_SOFT }}>Spese da importare</p>
                <p className="font-mono-num text-lg" style={{ color: "#fff" }}>{riepilogo.spese.length} · € {riepilogo.totSpese.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px]" style={{ color: BIANCO_SOFT }}>Entrate da importare</p>
                <p className="font-mono-num text-lg" style={{ color: "#fff" }}>{riepilogo.entrate.length} · € {riepilogo.totEntrate.toFixed(2)}</p>
              </div>
            </div>
            {riepilogo.daScegliere.length > 0 && (
              <p className="text-[11px] px-2 py-1.5 rounded-lg mb-1" style={{ background: "rgba(255,207,92,0.3)", color: "#fff" }}>
                {riepilogo.daScegliere.length} movimenti senza categoria: se non la scegli vengono saltati.
              </p>
            )}
            {riepilogo.gia > 0 && (
              <button onClick={() => setMostraGia((v) => !v)} className="text-[11px] underline mt-1" style={{ color: BIANCO_SOFT }}>
                {mostraGia ? "Nascondi" : "Mostra"} i {riepilogo.gia} già importati
              </button>
            )}
          </div>

          {/* Elenco movimenti */}
          <div className="flex flex-col gap-2 mb-4">
            {visibili.map((r) => {
              const daScegliere = r.scelta === "";
              return (
                <div
                  key={r.chiaveImport}
                  className={`${GLASS} rounded-2xl px-3 py-2.5`}
                  style={{
                    opacity: r.gia ? 0.5 : r.scelta === "salta" ? 0.7 : 1,
                    borderLeft: daScegliere ? "4px solid #ffcf5c" : undefined,
                  }}
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#fff" }}>{r.etichetta}</p>
                      <p className="text-[11px]" style={{ color: BIANCO_SOFT }}>
                        {dataBreve(r.data)} · {r.causale || "movimento"}
                        {r.motivo === "regola" && !r.toccata && (
                          <span className="inline-flex items-center gap-0.5 ml-1"><Sparkles size={10} /> imparato</span>
                        )}
                      </p>
                    </div>
                    <p className="font-mono-num text-sm font-semibold shrink-0" style={{ color: r.tipo === "entrata" ? "#c8f7c5" : "#fff" }}>
                      {r.tipo === "entrata" ? "+" : "−"} € {r.importo.toFixed(2)}
                    </p>
                  </div>

                  {r.gia ? (
                    <p className="text-[11px]" style={{ color: BIANCO_SOFT }}>Già importato</p>
                  ) : (
                    <>
                      {r.motivo === "doppione" && (
                        <p className="text-[11px] flex items-center gap-1 mb-1.5" style={{ color: "#ffe9a8" }}>
                          <AlertTriangle size={11} /> Forse già inserita: {r.doppioneDi}
                        </p>
                      )}
                      <select
                        value={r.scelta}
                        onChange={(e) => onSelect(r, e.target.value)}
                        className="w-full rounded-xl px-2 py-1.5 text-sm"
                        style={{ background: "#fff" }}
                      >
                        {r.tipo === "uscita" ? (
                          <>
                            <option value="">— Scegli categoria —</option>
                            <option value="salta">Non importare</option>
                            <option value="__nuova">+ Nuova categoria…</option>
                            {GRUPPI.map((g) => {
                              const cats = categorie.filter((c) => c.gruppo === g.id);
                              if (cats.length === 0) return null;
                              return (
                                <optgroup key={g.id} label={g.label}>
                                  {cats.map((c) => (
                                    <option key={c.id} value={`cat:${c.id}`}>{c.nome}</option>
                                  ))}
                                </optgroup>
                              );
                            })}
                          </>
                        ) : (
                          <>
                            <option value="entrata">Importa come entrata</option>
                            <option value="salta">Non importare</option>
                          </>
                        )}
                      </select>

                      {nuovaCatPer === r.chiaveImport && (
                        <div className="mt-2 p-2 rounded-xl flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.15)" }}>
                          <div className="flex gap-1.5">
                            {GRUPPI.map((g) => (
                              <button
                                key={g.id}
                                onClick={() => setNuovaCatGruppo(g.id)}
                                className="flex-1 py-1 rounded-lg text-[11px] font-medium"
                                style={nuovaCatGruppo === g.id ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
                              >
                                {g.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              autoFocus
                              value={nuovaCatNome}
                              onChange={(e) => setNuovaCatNome(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") creaNuovaCategoria(r.chiaveImport); }}
                              placeholder="es. Ristoranti e bar"
                              className="flex-1 min-w-0 rounded-lg px-2 py-1.5 text-sm"
                              style={{ background: "#fff" }}
                            />
                            <button
                              onClick={() => creaNuovaCategoria(r.chiaveImport)}
                              disabled={creandoCat}
                              className="px-3 rounded-lg flex items-center gap-1 text-xs font-medium disabled:opacity-60"
                              style={{ background: T.forest, color: "#fff" }}
                            >
                              <Plus size={14} /> Crea
                            </button>
                            <button onClick={() => setNuovaCatPer(null)} className="px-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                              Annulla
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleImporta}
            disabled={stato === "importo" || riepilogo.spese.length + riepilogo.entrate.length === 0}
            className="w-full py-3 rounded-2xl font-display text-sm disabled:opacity-60"
            style={{ background: T.forest, color: "#fff" }}
          >
            {stato === "importo"
              ? "Importo..."
              : `Importa ${riepilogo.spese.length} spese e ${riepilogo.entrate.length} entrate`}
          </button>
        </>
      )}
    </div>
  );
}
