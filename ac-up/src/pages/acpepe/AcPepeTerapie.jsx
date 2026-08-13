import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, Pause, Play } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import AcPepeHeader from "../../components/AcPepeHeader.jsx";
import {
  getTerapie,
  creaTerapia,
  aggiornaTerapia,
  toggleTerapiaAttiva,
  eliminaTerapia,
  getSomministrazioniData,
  segnaSomministrazione,
} from "../../lib/acPepe";

const BACKGROUND = "linear-gradient(180deg, #F5C518 0%, #E9311A 100%)";
const VUOTO = { nome: "", dose: "", orario: "", note: "" };

function oggiISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AcPepeTerapie() {
  const [terapie, setTerapie] = useState([]);
  const [fatte, setFatte] = useState({});
  const [nuova, setNuova] = useState(VUOTO);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    caricaTutto();
  }, []);

  async function caricaTutto() {
    const [listaTerapie, somministrazioni] = await Promise.all([
      getTerapie(false),
      getSomministrazioniData(oggiISO()),
    ]);
    setTerapie(listaTerapie);
    const mappa = {};
    somministrazioni.forEach((s) => { mappa[s.terapia_id] = s.fatto; });
    setFatte(mappa);
  }

  function handleModifica(t) {
    setEditingId(t.id);
    setNuova({ nome: t.nome, dose: t.dose || "", orario: t.orario || "", note: t.note || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function annullaModifica() {
    setEditingId(null);
    setNuova(VUOTO);
  }

  async function handleNuova() {
    if (!nuova.nome.trim()) return;
    if (editingId) {
      await aggiornaTerapia(editingId, nuova);
      setEditingId(null);
    } else {
      await creaTerapia(nuova);
    }
    setNuova(VUOTO);
    caricaTutto();
  }

  async function handleToggleAttiva(t) {
    await toggleTerapiaAttiva(t.id, !t.attiva);
    caricaTutto();
  }

  async function handleElimina(id) {
    await eliminaTerapia(id);
    if (editingId === id) annullaModifica();
    caricaTutto();
  }

  async function handleSpunta(terapiaId) {
    const nuovoStato = !fatte[terapiaId];
    setFatte((prev) => ({ ...prev, [terapiaId]: nuovoStato }));
    await segnaSomministrazione(terapiaId, oggiISO(), nuovoStato);
  }

  const terapieAttive = terapie.filter((t) => t.attiva);
  const terapiePausa = terapie.filter((t) => !t.attiva);

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <AcPepeHeader />
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Terapie</h1>

      {/* Checklist di oggi */}
      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Da fare oggi</h2>
      <div className="flex flex-col gap-2 mb-6">
        {terapieAttive.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna terapia attiva impostata.</p>
        )}
        {terapieAttive.map((t) => {
          const fatto = !!fatte[t.id];
          return (
            <button
              key={t.id}
              onClick={() => handleSpunta(t.id)}
              className={`${GLASS} rounded-2xl px-4 py-3 flex items-center justify-between text-left transition`}
              style={{ opacity: fatto ? 0.7 : 1 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ border: "1.5px solid rgba(255,255,255,0.6)", background: fatto ? "rgba(255,255,255,0.95)" : "transparent" }}
                >
                  {fatto && <Check size={13} style={{ color: T.forest }} strokeWidth={3} />}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#fff", textDecoration: fatto ? "line-through" : "none" }}>
                    {t.nome} {t.dose && `· ${t.dose}`}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {t.orario ? `ore ${t.orario}` : "orario non impostato"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Form nuova / modifica terapia */}
      <div className={`${GLASS} rounded-3xl p-4 mb-6`}>
        {editingId && (
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-display" style={{ color: "#fff" }}>Stai modificando una terapia</p>
            <button onClick={annullaModifica} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              Annulla
            </button>
          </div>
        )}

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Nome farmaco</label>
        <input
          value={nuova.nome}
          onChange={(e) => setNuova((prev) => ({ ...prev, nome: e.target.value }))}
          placeholder="es. Vetmedin"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Dose</label>
        <input
          value={nuova.dose}
          onChange={(e) => setNuova((prev) => ({ ...prev, dose: e.target.value }))}
          placeholder="es. mezza compressa"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Orario</label>
        <input
          type="time"
          value={nuova.orario}
          onChange={(e) => setNuova((prev) => ({ ...prev, orario: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Note (opzionale)</label>
        <input
          value={nuova.note}
          onChange={(e) => setNuova((prev) => ({ ...prev, note: e.target.value }))}
          placeholder="es. con il cibo"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <button onClick={handleNuova} className="w-full py-2.5 rounded-xl font-display text-sm" style={{ background: T.forest, color: "#fff" }}>
          {editingId ? "Aggiorna terapia" : "Aggiungi terapia"}
        </button>
      </div>

      {/* Elenco completo terapie attive, con modifica/pausa/elimina */}
      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Tutte le terapie</h2>
      <div className="flex flex-col gap-2">
        {terapieAttive.map((t) => (
          <div key={t.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`} style={{ outline: editingId === t.id ? "2px solid rgba(255,255,255,0.6)" : "none" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>{t.nome} {t.dose && `· ${t.dose}`}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{t.orario ? `ore ${t.orario}` : "senza orario"}{t.note ? ` · ${t.note}` : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleModifica(t)} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Pencil size={15} color="#fff" />
              </button>
              <button onClick={() => handleToggleAttiva(t)} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Pause size={15} color="#fff" />
              </button>
              <button onClick={() => handleElimina(t.id)} className="p-2 rounded-lg" style={{ background: "rgba(224,82,82,0.35)" }}>
                <Trash2 size={15} color="#fff" />
              </button>
            </div>
          </div>
        ))}

        {terapiePausa.length > 0 && (
          <>
            <p className="text-xs mt-3 mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>In pausa</p>
            {terapiePausa.map((t) => (
              <div key={t.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`} style={{ opacity: 0.6 }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#fff" }}>{t.nome} {t.dose && `· ${t.dose}`}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>in pausa</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleAttiva(t)} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.2)" }}>
                    <Play size={15} color="#fff" />
                  </button>
                  <button onClick={() => handleElimina(t.id)} className="p-2 rounded-lg" style={{ background: "rgba(224,82,82,0.35)" }}>
                    <Trash2 size={15} color="#fff" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
