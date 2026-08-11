import { useEffect, useState } from "react";
import { Home as HomeIcon, Car, Bike, HeartPulse } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { getCategorie, creaRicorrente, aggiornaRicorrente, getRicorrenti, toggleRicorrente, eliminaRicorrente } from "../../lib/acHome";
import PersonaSelector, { getPersonaPredefinita } from "../../components/PersonaSelector.jsx";

const GRUPPI = [
  { id: "casa", label: "Casa", icon: HomeIcon },
  { id: "auto", label: "Auto", icon: Car },
  { id: "scooter", label: "Scooter", icon: Bike },
  { id: "mediche", label: "Spese mediche", icon: HeartPulse },
];

const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";
const VUOTO = { categoria_id: "", importo: "", descrizione: "", giorno_mese: "1", fino_al: "" };

export default function AcHomeRicorrenti() {
  const [categorie, setCategorie] = useState([]);
  const [ricorrenti, setRicorrenti] = useState([]);
  const [nuova, setNuova] = useState(VUOTO);
  const [editingId, setEditingId] = useState(null);
  const [persona, setPersona] = useState(getPersonaPredefinita());

  useEffect(() => {
    caricaCategorieTutte();
    caricaRicorrenti();
  }, []);

  async function caricaCategorieTutte() {
    const tutte = await Promise.all(GRUPPI.map((g) => getCategorie(g.id)));
    setCategorie(tutte.flat());
  }

  async function caricaRicorrenti() {
    setRicorrenti(await getRicorrenti());
  }

  function handleModifica(r) {
    setEditingId(r.id);
    setNuova({
      categoria_id: r.categoria_id || "",
      importo: String(r.importo),
      descrizione: r.descrizione || "",
      giorno_mese: String(r.giorno_mese),
      fino_al: r.fino_al || "",
    });
    setPersona(r.persona || getPersonaPredefinita());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function annullaModifica() {
    setEditingId(null);
    setNuova(VUOTO);
    setPersona(getPersonaPredefinita());
  }

  async function handleNuova() {
    if (!nuova.categoria_id || !nuova.importo) return;
    const payload = {
      categoria_id: nuova.categoria_id,
      importo: parseFloat(nuova.importo),
      descrizione: nuova.descrizione,
      giorno_mese: parseInt(nuova.giorno_mese, 10) || 1,
      fino_al: nuova.fino_al || null,
      persona,
    };
    if (editingId) {
      await aggiornaRicorrente(editingId, payload);
      setEditingId(null);
    } else {
      await creaRicorrente(payload);
    }
    setNuova(VUOTO);
    caricaRicorrenti();
  }

  async function handleToggle(r) {
    await toggleRicorrente(r.id, !r.attiva);
    caricaRicorrenti();
  }

  async function handleElimina(id) {
    await eliminaRicorrente(id);
    if (editingId === id) annullaModifica();
    caricaRicorrenti();
  }

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Ricorrenti</h1>

      <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
        Le spese ricorrenti (mutuo, rate, abbonamenti) vengono aggiunte automaticamente ogni mese, al giorno indicato, appena apri l'app.
      </p>

      <div className={`${GLASS} rounded-3xl p-4 mb-6`}>
        {editingId && (
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-display" style={{ color: "#fff" }}>Stai modificando una ricorrente</p>
            <button onClick={annullaModifica} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              Annulla
            </button>
          </div>
        )}

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Categoria</label>
        <select
          value={nuova.categoria_id}
          onChange={(e) => setNuova((prev) => ({ ...prev, categoria_id: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        >
          <option value="">Seleziona sottocategoria...</option>
          {categorie.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Descrizione</label>
        <input
          value={nuova.descrizione}
          onChange={(e) => setNuova((prev) => ({ ...prev, descrizione: e.target.value }))}
          placeholder="es. Mutuo casa"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Importo mensile (€)</label>
        <input
          type="number"
          step="0.01"
          value={nuova.importo}
          onChange={(e) => setNuova((prev) => ({ ...prev, importo: e.target.value }))}
          placeholder="0.00"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3 font-mono-num"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Giorno del mese</label>
        <input
          type="number"
          min="1"
          max="31"
          value={nuova.giorno_mese}
          onChange={(e) => setNuova((prev) => ({ ...prev, giorno_mese: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Fino al (opzionale — es. fine di un finanziamento)</label>
        <input
          type="date"
          value={nuova.fino_al}
          onChange={(e) => setNuova((prev) => ({ ...prev, fino_al: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <PersonaSelector value={persona} onChange={setPersona} />

        <button onClick={handleNuova} className="w-full py-2.5 rounded-xl font-display text-sm" style={{ background: T.forest, color: "#fff" }}>
          {editingId ? "Aggiorna ricorrente" : "Aggiungi ricorrente"}
        </button>
      </div>

      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Le tue spese ricorrenti</h2>
      <div className="flex flex-col gap-2">
        {ricorrenti.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna spesa ricorrente impostata.</p>}
        {ricorrenti.map((r) => (
          <div key={r.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`} style={{ opacity: r.attiva ? 1 : 0.55, outline: editingId === r.id ? "2px solid rgba(255,255,255,0.6)" : "none" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>{r.descrizione || r.ac_home_categorie?.nome}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                {r.ac_home_categorie?.nome} · ogni {r.giorno_mese} del mese{r.persona ? ` · ${r.persona}` : ""} · {r.fino_al ? `fino al ${r.fino_al}` : "senza scadenza"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-mono-num font-semibold text-sm" style={{ color: "#fff" }}>€ {Number(r.importo).toFixed(2)}</p>
              <button onClick={() => handleModifica(r)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                Modifica
              </button>
              <button onClick={() => handleToggle(r)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                {r.attiva ? "Pausa" : "Riattiva"}
              </button>
              <button onClick={() => handleElimina(r.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}>
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
