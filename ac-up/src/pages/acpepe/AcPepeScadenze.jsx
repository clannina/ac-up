import { useEffect, useState } from "react";
import { T, GLASS } from "../../lib/theme";
import { getScadenze, creaScadenza, aggiornaScadenza, eliminaScadenza } from "../../lib/acPepe";
import { attivaNotifichePush, notifichePushAttive } from "../../lib/push";
import AcPepeHeader from "../../components/AcPepeHeader.jsx";

const BACKGROUND = "linear-gradient(180deg, #FF914D 0%, #AB003E 100%)";
const VUOTO = { titolo: "", data_scadenza: "", ricorrenza: "una_tantum", ora_notifica: "09:00", note: "" };

function giorniMancanti(dataScadenza) {
  const oggiZero = new Date();
  oggiZero.setHours(0, 0, 0, 0);
  const d = new Date(dataScadenza);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - oggiZero) / (1000 * 60 * 60 * 24));
}

export default function AcPepeScadenze() {
  const [scadenze, setScadenze] = useState([]);
  const [nuova, setNuova] = useState(VUOTO);
  const [editingId, setEditingId] = useState(null);
  const [pushAttive, setPushAttive] = useState(false);
  const [pushErrore, setPushErrore] = useState(null);

  useEffect(() => {
    caricaScadenze();
    notifichePushAttive().then(setPushAttive);
  }, []);

  async function caricaScadenze() {
    setScadenze(await getScadenze());
  }

  function handleModifica(s) {
    setEditingId(s.id);
    setNuova({
      titolo: s.titolo,
      data_scadenza: s.data_scadenza,
      ricorrenza: s.ricorrenza || "una_tantum",
      ora_notifica: s.ora_notifica || "09:00",
      note: s.note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function annullaModifica() {
    setEditingId(null);
    setNuova(VUOTO);
  }

  async function handleNuova() {
    if (!nuova.titolo.trim() || !nuova.data_scadenza) return;
    if (editingId) {
      await aggiornaScadenza(editingId, nuova);
      setEditingId(null);
    } else {
      await creaScadenza(nuova);
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
      <AcPepeHeader />
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Scadenze</h1>

      <div className={`${GLASS} rounded-2xl p-4 mb-4`}>
        <p className="text-sm font-medium mb-1" style={{ color: "#fff" }}>Notifiche push</p>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
          Ricevi un avviso a 5, 2 e 1 giorno dalla scadenza (es. visite, richiami vaccinali), anche ad app chiusa.
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
          placeholder="es. Visita cardiologica di controllo"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Data</label>
        <input
          type="date"
          value={nuova.data_scadenza}
          onChange={(e) => setNuova((prev) => ({ ...prev, data_scadenza: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Orario della notifica</label>
        <input
          type="time"
          value={nuova.ora_notifica}
          onChange={(e) => setNuova((prev) => ({ ...prev, ora_notifica: e.target.value }))}
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
          <option value="annuale">Ogni anno (es. richiamo vaccinale)</option>
          <option value="biennale">Ogni due anni</option>
        </select>

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Note (opzionale)</label>
        <input
          value={nuova.note}
          onChange={(e) => setNuova((prev) => ({ ...prev, note: e.target.value }))}
          placeholder="es. portare esami precedenti"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

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
            <div key={s.id} className={`${GLASS} rounded-2xl px-4 py-3`} style={{ outline: editingId === s.id ? "2px solid rgba(255,255,255,0.6)" : "none" }}>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#fff" }}>{s.titolo}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {s.data_scadenza} · {giorni < 0 ? "scaduta" : giorni === 0 ? "oggi" : `tra ${giorni} giorni`}
                    {s.ricorrenza !== "una_tantum" && ` · si ripete ${s.ricorrenza === "annuale" ? "ogni anno" : "ogni 2 anni"}`}
                    {s.note ? ` · ${s.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleModifica(s)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                    Modifica
                  </button>
                  <button onClick={() => handleElimina(s.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}>
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
