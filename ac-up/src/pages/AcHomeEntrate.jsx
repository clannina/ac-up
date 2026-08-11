import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import {
  getEntrate,
  creaEntrata,
  eliminaEntrata,
  getEntrateRicorrenti,
  creaEntrataRicorrente,
  toggleEntrataRicorrente,
  eliminaEntrataRicorrente,
  getSpese,
} from "../../lib/acHome";

const GRUPPI = ["casa", "auto", "scooter"];
const oggi = new Date();
const MESE_CORRENTE = oggi.getMonth() + 1;
const ANNO_CORRENTE = oggi.getFullYear();
const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";

export default function AcHomeEntrate() {
  const [entrate, setEntrate] = useState([]);
  const [ricorrenti, setRicorrenti] = useState([]);
  const [totaleSpeseMese, setTotaleSpeseMese] = useState(0);
  const [nuova, setNuova] = useState({ importo: "", descrizione: "", data: oggi.toISOString().slice(0, 10) });
  const [nuovaRicorrente, setNuovaRicorrente] = useState({ importo: "", descrizione: "", giorno_mese: "1" });

  useEffect(() => {
    caricaEntrate();
    caricaRicorrenti();
    caricaTotaleSpese();
  }, []);

  async function caricaEntrate() {
    setEntrate(await getEntrate(MESE_CORRENTE, ANNO_CORRENTE));
  }

  async function caricaRicorrenti() {
    setRicorrenti(await getEntrateRicorrenti());
  }

  async function caricaTotaleSpese() {
    const tutte = await Promise.all(GRUPPI.map((g) => getSpese({ mese: MESE_CORRENTE, anno: ANNO_CORRENTE, gruppo: g })));
    setTotaleSpeseMese(tutte.flat().reduce((tot, s) => tot + Number(s.importo), 0));
  }

  async function handleNuova() {
    if (!nuova.importo || !nuova.data) return;
    await creaEntrata({ importo: parseFloat(nuova.importo), descrizione: nuova.descrizione, data: nuova.data });
    setNuova({ importo: "", descrizione: "", data: oggi.toISOString().slice(0, 10) });
    caricaEntrate();
  }

  async function handleElimina(id) {
    await eliminaEntrata(id);
    caricaEntrate();
  }

  async function handleNuovaRicorrente() {
    if (!nuovaRicorrente.importo) return;
    await creaEntrataRicorrente({
      importo: parseFloat(nuovaRicorrente.importo),
      descrizione: nuovaRicorrente.descrizione,
      giorno_mese: parseInt(nuovaRicorrente.giorno_mese, 10) || 1,
    });
    setNuovaRicorrente({ importo: "", descrizione: "", giorno_mese: "1" });
    caricaRicorrenti();
  }

  async function handleToggleRicorrente(r) {
    await toggleEntrataRicorrente(r.id, !r.attiva);
    caricaRicorrenti();
  }

  async function handleEliminaRicorrente(id) {
    await eliminaEntrataRicorrente(id);
    caricaRicorrenti();
  }

  const totaleEntrateMese = entrate.reduce((tot, e) => tot + Number(e.importo), 0);
  const residuo = totaleEntrateMese - totaleSpeseMese;

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Entrate</h1>

      {/* Riepilogo residuo mensile */}
      <div className={`${GLASS} rounded-3xl p-4 mb-5`}>
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={18} color="#fff" />
          <p className="font-display text-sm" style={{ color: "#fff" }}>Residuo di questo mese</p>
        </div>
        <p className="font-mono-num text-3xl" style={{ color: residuo >= 0 ? "#fff" : "#ffd0d0" }}>
          € {residuo.toFixed(2)}
        </p>
        <div className="flex justify-between mt-2 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
          <span>Entrate: € {totaleEntrateMese.toFixed(2)}</span>
          <span>Spese: € {totaleSpeseMese.toFixed(2)}</span>
        </div>
      </div>

      {/* Nuova entrata */}
      <div className={`${GLASS} rounded-3xl p-4 mb-6`}>
        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Descrizione</label>
        <input
          value={nuova.descrizione}
          onChange={(e) => setNuova((prev) => ({ ...prev, descrizione: e.target.value }))}
          placeholder="es. Rimborso spese"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Importo (€)</label>
        <input
          type="number"
          step="0.01"
          value={nuova.importo}
          onChange={(e) => setNuova((prev) => ({ ...prev, importo: e.target.value }))}
          placeholder="0.00"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3 font-mono-num"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Data</label>
        <input
          type="date"
          value={nuova.data}
          onChange={(e) => setNuova((prev) => ({ ...prev, data: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <button onClick={handleNuova} className="w-full py-2.5 rounded-xl font-display text-sm" style={{ background: T.forest, color: "#fff" }}>
          Aggiungi entrata
        </button>
      </div>

      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Entrate di questo mese</h2>
      <div className="flex flex-col gap-2 mb-6">
        {entrate.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna entrata registrata.</p>}
        {entrate.map((e) => (
          <div key={e.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>
                {e.descrizione || "Entrata"} {e.entrata_ricorrente_id && <span className="text-xs opacity-70">· ricorrente</span>}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{e.data}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-mono-num font-semibold" style={{ color: "#fff" }}>€ {Number(e.importo).toFixed(2)}</p>
              <button onClick={() => handleElimina(e.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}>
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Entrate ricorrenti (stipendio) */}
      <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
        Le entrate ricorrenti (es. stipendio) vengono aggiunte automaticamente ogni mese, al giorno indicato, appena apri l'app.
      </p>
      <div className={`${GLASS} rounded-3xl p-4 mb-6`}>
        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Descrizione</label>
        <input
          value={nuovaRicorrente.descrizione}
          onChange={(e) => setNuovaRicorrente((prev) => ({ ...prev, descrizione: e.target.value }))}
          placeholder="es. Stipendio"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Importo mensile (€)</label>
        <input
          type="number"
          step="0.01"
          value={nuovaRicorrente.importo}
          onChange={(e) => setNuovaRicorrente((prev) => ({ ...prev, importo: e.target.value }))}
          placeholder="0.00"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3 font-mono-num"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Giorno del mese</label>
        <input
          type="number"
          min="1"
          max="31"
          value={nuovaRicorrente.giorno_mese}
          onChange={(e) => setNuovaRicorrente((prev) => ({ ...prev, giorno_mese: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <button onClick={handleNuovaRicorrente} className="w-full py-2.5 rounded-xl font-display text-sm" style={{ background: T.forest, color: "#fff" }}>
          Aggiungi entrata ricorrente
        </button>
      </div>

      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Le tue entrate ricorrenti</h2>
      <div className="flex flex-col gap-2">
        {ricorrenti.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna entrata ricorrente impostata.</p>}
        {ricorrenti.map((r) => (
          <div key={r.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`} style={{ opacity: r.attiva ? 1 : 0.55 }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>{r.descrizione || "Entrata"}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>ogni {r.giorno_mese} del mese</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-mono-num font-semibold text-sm" style={{ color: "#fff" }}>€ {Number(r.importo).toFixed(2)}</p>
              <button onClick={() => handleToggleRicorrente(r)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                {r.attiva ? "Pausa" : "Riattiva"}
              </button>
              <button onClick={() => handleEliminaRicorrente(r.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}>
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
