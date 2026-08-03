import { useEffect, useState } from "react";
import { Home as HomeIcon, Car, Bike } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { getCategorie, getScadenze, creaScadenza, eliminaScadenza } from "../../lib/acHome";
import { attivaNotifichePush, notifichePushAttive } from "../../lib/push";

const GRUPPI = [
  { id: "casa", label: "Casa", icon: HomeIcon },
  { id: "auto", label: "Auto", icon: Car },
  { id: "scooter", label: "Scooter", icon: Bike },
];

const BACKGROUND = "linear-gradient(160deg, #1B4F72 0%, #2E86AB 45%, #5FCFC0 100%)";

function giorniMancanti(dataScadenza) {
  const oggiZero = new Date();
  oggiZero.setHours(0, 0, 0, 0);
  const d = new Date(dataScadenza);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - oggiZero) / (1000 * 60 * 60 * 24));
}

export default function AcHomeScadenze() {
  const [categorie, setCategorie] = useState([]);
  const [scadenze, setScadenze] = useState([]);
  const [nuova, setNuova] = useState({ categoria_id: "", titolo: "", data_scadenza: "" });
  const [pushAttive, setPushAttive] = useState(false);
  const [pushErrore, setPushErrore] = useState(null);

  useEffect(() => {
    caricaCategorieTutte();
    caricaScadenze();
    notifichePushAttive().then(setPushAttive);
  }, []);

  async function caricaCategorieTutte() {
    const tutte = await Promise.all(GRUPPI.map((g) => getCategorie(g.id)));
    setCategorie(tutte.flat());
  }

  async function caricaScadenze() {
    setScadenze(await getScadenze());
  }

  async function handleNuova() {
    if (!nuova.titolo.trim() || !nuova.data_scadenza) return;
    await creaScadenza(nuova);
    setNuova({ categoria_id: "", titolo: "", data_scadenza: "" });
    caricaScadenze();
  }

  async function handleElimina(id) {
    await eliminaScadenza(id);
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
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND, backgroundAttachment: "fixed" }}>
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
        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Titolo</label>
        <input
          value={nuova.titolo}
          onChange={(e) => setNuova((prev) => ({ ...prev, titolo: e.target.value }))}
          placeholder="es. Revisione auto"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

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

        <button onClick={handleNuova} className="w-full py-2.5 rounded-xl font-display text-sm" style={{ background: T.forest, color: "#fff" }}>
          Aggiungi scadenza
        </button>
      </div>

      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Le tue scadenze</h2>
      <div className="flex flex-col gap-2">
        {scadenze.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna scadenza impostata.</p>}
        {scadenze.map((s) => {
          const giorni = giorniMancanti(s.data_scadenza);
          return (
            <div key={s.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`}>
              <div>
                <p className="text-sm font-medium" style={{ color: "#fff" }}>{s.titolo}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {s.data_scadenza} {s.ac_home_categorie?.nome ? `· ${s.ac_home_categorie.nome}` : ""} ·{" "}
                  {giorni < 0 ? "scaduta" : giorni === 0 ? "oggi" : `tra ${giorni} giorni`}
                </p>
              </div>
              <button onClick={() => handleElimina(s.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}>
                Elimina
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
