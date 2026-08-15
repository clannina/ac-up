import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, Pause, Play, FileText, X } from "lucide-react";
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
  caricaRicettaTerapia,
  rimuoviRicettaTerapia,
} from "../../lib/acPepe";

const BACKGROUND = "linear-gradient(180deg, #F5C518 0%, #E9311A 100%)";
const VUOTO = { nome: "", dose: "", orariTesto: "", note: "" };

function oggiISO() {
  return new Date().toISOString().slice(0, 10);
}

// "08:00, 14:00, 20:00" -> ["08:00","14:00","20:00"], ordinati e senza duplicati/vuoti
function parseOrari(testo) {
  const set = new Set(
    testo
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  return Array.from(set).sort();
}

export default function AcPepeTerapie() {
  const [terapie, setTerapie] = useState([]);
  const [fatte, setFatte] = useState({}); // chiave: `${terapiaId}__${orario}`
  const [nuova, setNuova] = useState(VUOTO);
  const [ricettaFile, setRicettaFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [salvando, setSalvando] = useState(false);

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
    somministrazioni.forEach((s) => { mappa[`${s.terapia_id}__${s.orario}`] = s.fatto; });
    setFatte(mappa);
  }

  function handleModifica(t) {
    setEditingId(t.id);
    setNuova({
      nome: t.nome,
      dose: t.dose || "",
      orariTesto: (t.orari || []).join(", "),
      note: t.note || "",
    });
    setRicettaFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function annullaModifica() {
    setEditingId(null);
    setNuova(VUOTO);
    setRicettaFile(null);
  }

  async function handleNuova() {
    if (!nuova.nome.trim()) return;
    const orari = parseOrari(nuova.orariTesto);
    const payload = { nome: nuova.nome, dose: nuova.dose, orari, note: nuova.note };

    setSalvando(true);
    try {
      if (editingId) {
        await aggiornaTerapia(editingId, payload);
        if (ricettaFile) {
          await caricaRicettaTerapia(editingId, ricettaFile);
        }
        setEditingId(null);
      } else {
        await creaTerapia({ ...payload, ricettaFile });
      }
      setNuova(VUOTO);
      setRicettaFile(null);
      caricaTutto();
    } finally {
      setSalvando(false);
    }
  }

  async function handleRimuoviRicetta(t) {
    await rimuoviRicettaTerapia(t.id, t.ricetta_percorso);
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

  async function handleSpunta(terapiaId, orario) {
    const chiave = `${terapiaId}__${orario}`;
    const nuovoStato = !fatte[chiave];
    setFatte((prev) => ({ ...prev, [chiave]: nuovoStato }));
    await segnaSomministrazione(terapiaId, oggiISO(), orario, nuovoStato);
  }

  const terapieAttive = terapie.filter((t) => t.attiva);
  const terapiePausa = terapie.filter((t) => !t.attiva);

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <AcPepeHeader />
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Terapie</h1>

      {/* Checklist di oggi: una riga per ogni orario di ogni terapia attiva */}
      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Da fare oggi</h2>
      <div className="flex flex-col gap-2 mb-6">
        {terapieAttive.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna terapia attiva impostata.</p>
        )}
        {terapieAttive.map((t) => {
          const orari = t.orari && t.orari.length > 0 ? t.orari : [""]; // "" = senza orario specifico
          return orari.map((orario) => {
            const chiave = `${t.id}__${orario}`;
            const fatto = !!fatte[chiave];
            return (
              <button
                key={chiave}
                onClick={() => handleSpunta(t.id, orario)}
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
                      {orario ? `ore ${orario}` : "orario non impostato"}
                    </p>
                  </div>
                </div>
              </button>
            );
          });
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

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Orari (uno o più, separati da virgola)</label>
        <input
          value={nuova.orariTesto}
          onChange={(e) => setNuova((prev) => ({ ...prev, orariTesto: e.target.value }))}
          placeholder="es. 08:00, 14:00, 20:00"
          className="w-full rounded-xl px-3 py-2 text-sm mb-1"
          style={{ background: "#fff" }}
        />
        <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
          Stessa dose più volte al giorno? Aggiungi tutti gli orari qui, senza creare terapie separate.
        </p>

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Note (opzionale)</label>
        <input
          value={nuova.note}
          onChange={(e) => setNuova((prev) => ({ ...prev, note: e.target.value }))}
          placeholder="es. con il cibo"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Ricetta (opzionale)</label>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setRicettaFile(e.target.files?.[0] || null)}
          className="w-full rounded-xl px-3 py-2 text-xs mb-1"
          style={{ background: "#fff" }}
        />
        {editingId && !ricettaFile && (
          <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
            Seleziona un file solo se vuoi sostituire la ricetta già caricata.
          </p>
        )}
        {!editingId && (
          <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
            Foto o PDF della prescrizione del veterinario.
          </p>
        )}

        <button
          onClick={handleNuova}
          disabled={salvando}
          className="w-full py-2.5 rounded-xl font-display text-sm disabled:opacity-60"
          style={{ background: T.forest, color: "#fff" }}
        >
          {salvando ? "Salvo..." : editingId ? "Aggiorna terapia" : "Aggiungi terapia"}
        </button>
      </div>

      {/* Elenco completo terapie attive, con modifica/pausa/elimina */}
      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Tutte le terapie</h2>
      <div className="flex flex-col gap-2">
        {terapieAttive.map((t) => (
          <div key={t.id} className={`${GLASS} rounded-2xl px-4 py-3`} style={{ outline: editingId === t.id ? "2px solid rgba(255,255,255,0.6)" : "none" }}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium" style={{ color: "#fff" }}>{t.nome} {t.dose && `· ${t.dose}`}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {t.orari && t.orari.length > 0 ? `ore ${t.orari.join(", ")}` : "senza orario"}
                  {t.note ? ` · ${t.note}` : ""}
                </p>
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
            {t.ricetta_url && (
              <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                <a
                  href={t.ricetta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                >
                  <FileText size={13} /> Vedi ricetta
                </a>
                <button
                  onClick={() => handleRimuoviRicetta(t)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}
                >
                  <X size={13} /> Rimuovi
                </button>
              </div>
            )}
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
