import { useEffect, useState } from "react";
import { Home as HomeIcon, Car, Bike, HeartPulse } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { getCategorie, getScadenze, creaScadenza, aggiornaScadenza, eliminaScadenza, getVeicoli } from "../../lib/acHome";
import { attivaNotifichePush, notifichePushAttive } from "../../lib/push";
import PersonaSelector, { getPersonaPredefinita } from "../../components/PersonaSelector.jsx";
import AcHomeHeader from "../../components/AcHomeHeader.jsx";

const GRUPPI = [
  { id: "casa", label: "Casa", icon: HomeIcon },
  { id: "auto", label: "Auto", icon: Car },
  { id: "scooter", label: "Scooter", icon: Bike },
  { id: "mediche", label: "Spese mediche", icon: HeartPulse },
];

const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";
const VUOTO = { categoria_id: "", veicolo_id: "", titolo: "", data_scadenza: "", ricorrenza: "una_tantum" };

function giorniMancanti(dataScadenza) {
  const oggiZero = new Date();
  oggiZero.setHours(0, 0, 0, 0);
  const d = new Date(dataScadenza);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - oggiZero) / (1000 * 60 * 60 * 24));
}

export default function AcHomeScadenze() {
  const [categorie, setCategorie] = useState([]);
  const [veicoli, setVeicoli] = useState([]);
  const [scadenze, setScadenze] = useState([]);
  const [nuova, setNuova] = useState(VUOTO);
  const [editingId, setEditingId] = useState(null);
  const [persona, setPersona] = useState(getPersonaPredefinita());
  const [pushAttive, setPushAttive] = useState(false);
  const [pushErrore, setPushErrore] = useState(null);

  useEffect(() => {
    caricaCategorieTutte();
    caricaScadenze();
    caricaVeicoli();
    notifichePushAttive().then(setPushAttive);
  }, []);

  async function caricaVeicoli() {
    setVeicoli(await getVeicoli());
  }

  async function caricaCategorieTutte() {
    const tutte = await Promise.all(GRUPPI.map((g) => getCategorie(g.id)));
    setCategorie(tutte.flat());
  }

  async function caricaScadenze() {
    setScadenze(await getScadenze());
  }

  function handleModifica(s) {
    setEditingId(s.id);
    setNuova({
      categoria_id: s.categoria_id || "",
      veicolo_id: s.veicolo_id || "",
      titolo: s.titolo,
      data_scadenza: s.data_scadenza,
      ricorrenza: s.ricorrenza || "una_tantum",
    });
    setPersona(s.persona || getPersonaPredefinita());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function annullaModifica() {
    setEditingId(null);
    setNuova(VUOTO);
    setPersona(getPersonaPredefinita());
  }

  async function handleNuova() {
    if (!nuova.titolo.trim() || !nuova.data_scadenza) return;
    const payload = { ...nuova, persona };
    if (editingId) {
      await aggiornaScadenza(editingId, payload);
      setEditingId(null);
    } else {
      await creaScadenza(payload);
    }
    setNuova(VUOTO);
    caricaScadenze();
  }

  async function handleElimina(id) {
    await eliminaScadenza(id);
    if (editingId === id) annullaModifica();
    caricaScadenze();
  }

  async function handleAttivaPush() {
    setPushErrore(null);
    try {
      await attivaNotifichePush();
      setPushAttive(true);
    } catch (err) {
      setPushErrore(err.message);
    }
  }

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <AcHomeHeader />
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Scadenze</h1>

      <div className={`${GLASS} rounded-2xl p-4 mb-4`}>
        <p className="text-sm font-medium mb-1" style={{ color: "#fff" }}>Notifiche push</p>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
          Ricevi un avviso a 5, 2 e 1 giorno dalla scadenza, anche ad app chiusa.
        </p>
        {pushAttive ? (
          <p className="text-xs font-medium" style={{ color: "#fff" }}>✓ Notifiche attive su questo dispositivo</p>
        ) : (
          <button onClick={handleAttivaPush} className="w-full py-2 rounded-xl text-sm font-display" style={{ background: T.forest, color: "#fff" }}>
            Attiva notifiche su questo dispositivo
          </button>
        )}
        {pushErrore && <p className="text-xs text-red-100 mt-2">{pushErrore}</p>}
      </div>

      <div className={`${GLASS} rounded-3xl p-4 mb-6`}>
        {editingId && (
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-display" style={{ color: "#fff" }}>Stai modificando una scadenza</p>
            <button onClick={annullaModifica} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              Annulla
            </button>
          </div>
        )}

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Titolo</label>
        <input
          value={nuova.titolo}
          onChange={(e) => setNuova((prev) => ({ ...prev, titolo: e.target.value }))}
          placeholder="es. Revisione auto"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Veicolo (opzionale)</label>
        <select
          value={nuova.veicolo_id}
          onChange={(e) => setNuova((prev) => ({ ...prev, veicolo_id: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        >
          <option value="">Nessun veicolo collegato</option>
          {veicoli.map((v) => (
            <option key={v.id} value={v.id}>{v.nome} {v.targa ? `(${v.targa})` : ""}</option>
          ))}
        </select>

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Categoria (opzionale)</label>
        <select
          value={nuova.categoria_id}
          onChange={(e) => setNuova((prev) => ({ ...prev, categoria_id: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        >
          <option value="">Nessuna categoria collegata</option>
          {categorie.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Data di scadenza</label>
        <input
          type="date"
          value={nuova.data_scadenza}
          onChange={(e) => setNuova((prev) => ({ ...prev, data_scadenza: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Si ripete</label>
        <select
          value={nuova.ricorrenza}
          onChange={(e) => setNuova((prev) => ({ ...prev, ricorrenza: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        >
          <option value="una_tantum">Una tantum (non si ripete)</option>
          <option value="annuale">Ogni anno (es. bollo)</option>
          <option value="biennale">Ogni due anni (es. revisione)</option>
        </select>

        <PersonaSelector value={persona} onChange={setPersona} />

        <button onClick={handleNuova} className="w-full py-2.5 rounded-xl font-display text-sm" style={{ background: T.forest, color: "#fff" }}>
          {editingId ? "Aggiorna scadenza" : "Aggiungi scadenza"}
        </button>
      </div>

      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Le tue scadenze</h2>
      <div className="flex flex-col gap-2">
        {scadenze.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna scadenza impostata.</p>}
        {scadenze.map((s) => {
          const giorni = giorniMancanti(s.data_scadenza);
          return (
            <div key={s.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`} style={{ outline: editingId === s.id ? "2px solid rgba(255,255,255,0.6)" : "none" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "#fff" }}>{s.titolo}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {s.data_scadenza} {s.ac_home_veicoli?.nome ? `· ${s.ac_home_veicoli.nome}` : ""} {s.ac_home_categorie?.nome ? `· ${s.ac_home_categorie.nome}` : ""}{s.persona ? ` · ${s.persona}` : ""} ·{" "}
                  {giorni < 0 ? "scaduta" : giorni === 0 ? "oggi" : `tra ${giorni} giorni`}
                  {s.ricorrenza !== "una_tantum" && ` · si ripete ${s.ricorrenza === "annuale" ? "ogni anno" : "ogni 2 anni"}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleModifica(s)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                  Modifica
                </button>
                <button onClick={() => handleElimina(s.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}>
                  Elimina
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
