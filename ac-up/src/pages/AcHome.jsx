import { useEffect, useState } from "react";
import { T } from "../lib/theme";
import {
  getCategorie,
  creaCategoria,
  getSpese,
  creaSpesa,
  caricaFotoScontrino,
  getBudget,
  impostaBudget,
  getRicorrenti,
  creaRicorrente,
  toggleRicorrente,
  eliminaRicorrente,
  generaSpeseRicorrentiDelMese,
} from "../lib/acHome";

const GRUPPI = [
  { id: "casa", label: "Casa", emoji: "🏠" },
  { id: "auto", label: "Auto", emoji: "🚗" },
  { id: "scooter", label: "Scooter", emoji: "🛵" },
];

const oggi = new Date();
const MESE_CORRENTE = oggi.getMonth() + 1;
const ANNO_CORRENTE = oggi.getFullYear();

export default function AcHome() {
  const [scheda, setScheda] = useState("spese"); // "spese" | "budget" | "ricorrenti"
  const [gruppo, setGruppo] = useState("casa");
  const [categorie, setCategorie] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [nuovaCategoria, setNuovaCategoria] = useState("");
  const [importo, setImporto] = useState("");
  const [data, setData] = useState(() => oggi.toISOString().slice(0, 10));
  const [nota, setNota] = useState("");
  const [foto, setFoto] = useState(null);
  const [spese, setSpese] = useState([]);
  const [budget, setBudget] = useState([]);
  const [budgetInput, setBudgetInput] = useState({});
  const [ricorrenti, setRicorrenti] = useState([]);
  const [nuovaRicorrente, setNuovaRicorrente] = useState({ categoria_id: "", importo: "", descrizione: "", giorno_mese: "1" });
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState(null);

  // All'apertura dell'app: genera (una sola volta) le spese ricorrenti di questo mese, poi carica tutto
  useEffect(() => {
    generaSpeseRicorrentiDelMese(MESE_CORRENTE, ANNO_CORRENTE).finally(() => {
      caricaCategorie();
      caricaSpese();
      caricaBudget();
      caricaRicorrenti();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    caricaCategorie();
    caricaSpese();
    caricaBudget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gruppo]);

  async function caricaCategorie() {
    const cats = await getCategorie(gruppo);
    setCategorie(cats);
    setCategoriaId(cats[0]?.id || "");
  }

  async function caricaSpese() {
    const lista = await getSpese({ mese: MESE_CORRENTE, anno: ANNO_CORRENTE, gruppo });
    setSpese(lista);
  }

  async function caricaBudget() {
    const lista = await getBudget(MESE_CORRENTE, ANNO_CORRENTE);
    setBudget(lista.filter((b) => b.ac_home_categorie?.gruppo === gruppo));
  }

  async function caricaRicorrenti() {
    const lista = await getRicorrenti();
    setRicorrenti(lista);
  }

  async function handleNuovaCategoria() {
    if (!nuovaCategoria.trim()) return;
    const cat = await creaCategoria(gruppo, nuovaCategoria.trim());
    setNuovaCategoria("");
    setCategorie((prev) => [...prev, cat]);
    setCategoriaId(cat.id);
  }

  async function handleSalva(e) {
    e.preventDefault();
    setErrore(null);
    if (!categoriaId || !importo || !data) {
      setErrore("Categoria, importo e data sono obbligatori.");
      return;
    }
    setSalvando(true);
    try {
      let foto_url = null;
      if (foto) {
        foto_url = await caricaFotoScontrino(foto);
      }
      await creaSpesa({ categoria_id: categoriaId, importo: parseFloat(importo), data, nota, foto_url });
      setImporto("");
      setNota("");
      setFoto(null);
      caricaSpese();
    } catch (err) {
      setErrore("Errore nel salvataggio: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleSalvaBudget(categoria_id) {
    const valore = parseFloat(budgetInput[categoria_id]);
    if (!valore && valore !== 0) return;
    await impostaBudget({ categoria_id, mese: MESE_CORRENTE, anno: ANNO_CORRENTE, importo: valore });
    caricaBudget();
  }

  async function handleNuovaRicorrente() {
    if (!nuovaRicorrente.categoria_id || !nuovaRicorrente.importo) return;
    await creaRicorrente({
      categoria_id: nuovaRicorrente.categoria_id,
      importo: parseFloat(nuovaRicorrente.importo),
      descrizione: nuovaRicorrente.descrizione,
      giorno_mese: parseInt(nuovaRicorrente.giorno_mese, 10) || 1,
    });
    setNuovaRicorrente({ categoria_id: "", importo: "", descrizione: "", giorno_mese: "1" });
    caricaRicorrenti();
  }

  async function handleToggleRicorrente(r) {
    await toggleRicorrente(r.id, !r.attiva);
    caricaRicorrenti();
  }

  async function handleEliminaRicorrente(id) {
    await eliminaRicorrente(id);
    caricaRicorrenti();
  }

  function totaleSpesoCategoria(categoria_id) {
    return spese
      .filter((s) => s.categoria_id === categoria_id)
      .reduce((tot, s) => tot + Number(s.importo), 0);
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" style={{ background: T.paper, color: T.stone }}>
      <h1 className="text-2xl font-bold mb-4">AC Home</h1>

      <div className="flex gap-2 mb-4">
        {[
          { id: "spese", label: "Spese" },
          { id: "budget", label: "Budget" },
          { id: "ricorrenti", label: "Ricorrenti" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setScheda(s.id)}
            className="flex-1 py-2 rounded-2xl text-xs font-medium"
            style={scheda === s.id ? { background: T.forest, color: "#fff" } : { background: "rgba(0,0,0,0.05)", color: T.stone }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {scheda !== "ricorrenti" && (
        <div className="flex gap-2 mb-5">
          {GRUPPI.map((g) => (
            <button
              key={g.id}
              onClick={() => setGruppo(g.id)}
              className="flex-1 py-2 rounded-2xl text-sm font-medium transition-colors"
              style={
                gruppo === g.id
                  ? { background: T.forest, color: "#fff" }
                  : { background: "rgba(0,0,0,0.05)", color: T.stone }
              }
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
      )}

      {scheda === "spese" && (
        <>
          <form onSubmit={handleSalva} className="rounded-3xl p-4 mb-6" style={{ background: "rgba(0,0,0,0.03)" }}>
            <label className="block text-xs opacity-60 mb-1">Sottocategoria</label>
            <div className="flex gap-2 mb-3">
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="flex-1 rounded-xl px-3 py-2 text-sm"
                style={{ background: "#fff" }}
              >
                {categorie.length === 0 && <option value="">Nessuna categoria</option>}
                {categorie.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                value={nuovaCategoria}
                onChange={(e) => setNuovaCategoria(e.target.value)}
                placeholder="Nuova sottocategoria..."
                className="flex-1 rounded-xl px-3 py-2 text-sm"
                style={{ background: "#fff" }}
              />
              <button type="button" onClick={handleNuovaCategoria} className="px-3 rounded-xl text-sm" style={{ background: T.forest, color: "#fff" }}>
                +
              </button>
            </div>

            <label className="block text-xs opacity-60 mb-1">Importo (€)</label>
            <input
              type="number"
              step="0.01"
              value={importo}
              onChange={(e) => setImporto(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl px-3 py-2 text-sm mb-3"
              style={{ background: "#fff" }}
            />

            <label className="block text-xs opacity-60 mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm mb-3"
              style={{ background: "#fff" }}
            />

            <label className="block text-xs opacity-60 mb-1">Nota (opzionale)</label>
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="es. tagliando scooter"
              className="w-full rounded-xl px-3 py-2 text-sm mb-3"
              style={{ background: "#fff" }}
            />

            <label className="block text-xs opacity-60 mb-1">Foto scontrino (opzionale)</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
              className="w-full text-sm mb-3"
            />

            {errore && <p className="text-xs text-red-600 mb-2">{errore}</p>}

            <button
              type="submit"
              disabled={salvando}
              className="w-full py-2.5 rounded-xl font-medium text-sm"
              style={{ background: T.forest, color: "#fff", opacity: salvando ? 0.6 : 1 }}
            >
              {salvando ? "Salvo..." : "Salva spesa"}
            </button>
          </form>

          <h2 className="text-sm font-semibold mb-2 opacity-70">Spese di questo mese</h2>
          <div className="flex flex-col gap-2">
            {spese.length === 0 && <p className="text-sm opacity-50">Nessuna spesa registrata.</p>}
            {spese.map((s) => (
              <div key={s.id} className="rounded-2xl px-4 py-3 flex justify-between items-center" style={{ background: "rgba(0,0,0,0.03)" }}>
                <div>
                  <p className="text-sm font-medium">
                    {s.ac_home_categorie?.nome || "—"} {s.ricorrente_id && <span className="text-xs opacity-50">· ricorrente</span>}
                  </p>
                  <p className="text-xs opacity-50">{s.data} {s.nota ? `· ${s.nota}` : ""}</p>
                </div>
                <p className="font-mono font-semibold">€ {Number(s.importo).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {scheda === "budget" && (
        <>
          <h2 className="text-sm font-semibold mb-2 opacity-70">
            Budget di {oggi.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex flex-col gap-3">
            {categorie.length === 0 && <p className="text-sm opacity-50">Crea prima una sottocategoria nella scheda Spese.</p>}
            {categorie.map((c) => {
              const budgetRiga = budget.find((b) => b.categoria_id === c.id);
              const speso = totaleSpesoCategoria(c.id);
              const importoBudget = budgetRiga?.importo || 0;
              const percentuale = importoBudget > 0 ? Math.min(100, (speso / importoBudget) * 100) : 0;
              const sforato = importoBudget > 0 && speso > importoBudget;

              return (
                <div key={c.id} className="rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.03)" }}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">{c.nome}</p>
                    <p className="text-xs font-mono opacity-70">
                      € {speso.toFixed(2)} {importoBudget > 0 && `/ € ${Number(importoBudget).toFixed(2)}`}
                    </p>
                  </div>

                  {importoBudget > 0 && (
                    <div className="w-full h-2 rounded-full mb-3" style={{ background: "rgba(0,0,0,0.08)" }}>
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${percentuale}%`, background: sforato ? "#e05252" : T.forest }}
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Imposta budget mensile..."
                      value={budgetInput[c.id] ?? ""}
                      onChange={(e) => setBudgetInput((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      className="flex-1 rounded-xl px-3 py-2 text-sm"
                      style={{ background: "#fff" }}
                    />
                    <button
                      onClick={() => handleSalvaBudget(c.id)}
                      className="px-3 rounded-xl text-sm"
                      style={{ background: T.forest, color: "#fff" }}
                    >
                      Salva
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {scheda === "ricorrenti" && (
        <>
          <p className="text-xs opacity-60 mb-3">
            Le spese ricorrenti (mutuo, rate, abbonamenti) vengono aggiunte automaticamente ogni mese, al giorno indicato, appena apri l'app.
          </p>

          <div className="rounded-3xl p-4 mb-6" style={{ background: "rgba(0,0,0,0.03)" }}>
            <label className="block text-xs opacity-60 mb-1">Categoria</label>
            <select
              value={nuovaRicorrente.categoria_id}
              onChange={(e) => setNuovaRicorrente((prev) => ({ ...prev, categoria_id: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm mb-3"
              style={{ background: "#fff" }}
            >
              <option value="">Seleziona sottocategoria...</option>
              {categorie.map((c) => (
                <option key={c.id} value={c.id}>{GRUPPI.find((g) => g.id === c.gruppo)?.emoji} {c.nome}</option>
              ))}
            </select>
            <p className="text-xs opacity-50 mb-2">
              Non vedi la categoria che ti serve? Vai nella scheda Spese, seleziona il gruppo giusto (Casa/Auto/Scooter) e creala lì, poi torna qui.
            </p>

            <label className="block text-xs opacity-60 mb-1">Descrizione</label>
            <input
              value={nuovaRicorrente.descrizione}
              onChange={(e) => setNuovaRicorrente((prev) => ({ ...prev, descrizione: e.target.value }))}
              placeholder="es. Mutuo casa"
              className="w-full rounded-xl px-3 py-2 text-sm mb-3"
              style={{ background: "#fff" }}
            />

            <label className="block text-xs opacity-60 mb-1">Importo mensile (€)</label>
            <input
              type="number"
              step="0.01"
              value={nuovaRicorrente.importo}
              onChange={(e) => setNuovaRicorrente((prev) => ({ ...prev, importo: e.target.value }))}
              placeholder="0.00"
              className="w-full rounded-xl px-3 py-2 text-sm mb-3"
              style={{ background: "#fff" }}
            />

            <label className="block text-xs opacity-60 mb-1">Giorno del mese (es. 5 = il 5 di ogni mese)</label>
            <input
              type="number"
              min="1"
              max="31"
              value={nuovaRicorrente.giorno_mese}
              onChange={(e) => setNuovaRicorrente((prev) => ({ ...prev, giorno_mese: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm mb-3"
              style={{ background: "#fff" }}
            />

            <button
              onClick={handleNuovaRicorrente}
              className="w-full py-2.5 rounded-xl font-medium text-sm"
              style={{ background: T.forest, color: "#fff" }}
            >
              Aggiungi ricorrente
            </button>
          </div>

          <h2 className="text-sm font-semibold mb-2 opacity-70">Le tue spese ricorrenti</h2>
          <div className="flex flex-col gap-2">
            {ricorrenti.length === 0 && <p className="text-sm opacity-50">Nessuna spesa ricorrente impostata.</p>}
            {ricorrenti.map((r) => (
              <div key={r.id} className="rounded-2xl px-4 py-3 flex justify-between items-center" style={{ background: "rgba(0,0,0,0.03)", opacity: r.attiva ? 1 : 0.5 }}>
                <div>
                  <p className="text-sm font-medium">{r.descrizione || r.ac_home_categorie?.nome}</p>
                  <p className="text-xs opacity-50">{r.ac_home_categorie?.nome} · ogni {r.giorno_mese} del mese</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-semibold text-sm">€ {Number(r.importo).toFixed(2)}</p>
                  <button onClick={() => handleToggleRicorrente(r)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.08)" }}>
                    {r.attiva ? "Pausa" : "Riattiva"}
                  </button>
                  <button onClick={() => handleEliminaRicorrente(r.id)} className="text-xs px-2 py-1 rounded-lg text-red-600" style={{ background: "rgba(224,82,82,0.1)" }}>
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
