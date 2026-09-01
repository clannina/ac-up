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
  avanzaProssimaDose,
} from "../../lib/acPepe";

const BACKGROUND = "linear-gradient(180deg, #EE6C04 0%, #AB003E 100%)";
const VUOTO = {
  nome: "", orario1: "", dose1: "", orario2: "", dose2: "", orario3: "", dose3: "", note: "",
  frequenza: "giornaliera",
  intervalloGiorni: "3",
  prossimaDose: oggiISO(),
  oraIntervallo: "",
  doseIntervallo: "",
};

function oggiISO() {
  return new Date().toISOString().slice(0, 10);
}

// Ricava la lista {orario, dose} di una terapia, con fallback per quelle
// create prima di questa modifica (che avevano solo orari + una dose unica).
function orariDosiDi(t) {
  if (t.orari_dosi && t.orari_dosi.length > 0) return t.orari_dosi;
  if (t.orari && t.orari.length > 0) return t.orari.map((o) => ({ orario: o, dose: t.dose || "" }));
  return [{ orario: "", dose: t.dose || "" }];
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
    const od = orariDosiDi(t);
    setNuova({
      nome: t.nome,
      orario1: od[0]?.orario || "",
      dose1: od[0]?.dose || "",
      orario2: od[1]?.orario || "",
      dose2: od[1]?.dose || "",
      orario3: od[2]?.orario || "",
      dose3: od[2]?.dose || "",
      note: t.note || "",
      frequenza: t.frequenza || "giornaliera",
      intervalloGiorni: t.intervallo_giorni ? String(t.intervallo_giorni) : "3",
      prossimaDose: t.prossima_dose || oggiISO(),
      oraIntervallo: od[0]?.orario || "",
      doseIntervallo: od[0]?.dose || "",
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

    let payload;
    if (nuova.frequenza === "intervallo") {
      const orariDosi = nuova.oraIntervallo ? [{ orario: nuova.oraIntervallo, dose: nuova.doseIntervallo }] : [];
      payload = {
        nome: nuova.nome,
        dose: nuova.doseIntervallo || null,
        orari: orariDosi.map((o) => o.orario),
        orari_dosi: orariDosi,
        note: nuova.note,
        frequenza: "intervallo",
        intervallo_giorni: parseInt(nuova.intervalloGiorni, 10) || 1,
        prossima_dose: nuova.prossimaDose,
      };
    } else {
      const orariDosi = [
        { orario: nuova.orario1, dose: nuova.dose1 },
        { orario: nuova.orario2, dose: nuova.dose2 },
        { orario: nuova.orario3, dose: nuova.dose3 },
      ].filter((o) => o.orario);
      payload = {
        nome: nuova.nome,
        dose: orariDosi[0]?.dose || null,
        orari: orariDosi.map((o) => o.orario),
        orari_dosi: orariDosi,
        note: nuova.note,
        frequenza: "giornaliera",
        intervallo_giorni: null,
        prossima_dose: null,
      };
    }

    setSalvando(true);
    try {
      if (editingId) {
        await aggiornaTerapia(editingId, payload);
        if (ricettaFile) {
          await caricaRicettaTerapia(editingId, ricettaFile);
        }
        setEditingId(null);
      } else {
        await creaTerapia({ ...payload, orariDosi: payload.orari_dosi, ricettaFile });
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

  async function handleSpunta(terapia, orario) {
    const chiave = `${terapia.id}__${orario}`;
    const nuovoStato = !fatte[chiave];
    setFatte((prev) => ({ ...prev, [chiave]: nuovoStato }));
    await segnaSomministrazione(terapia.id, oggiISO(), orario, nuovoStato);

    // Terapia a intervalli (es. ogni 72 ore): quando la spunti come fatta,
    // la prossima dose si sposta automaticamente avanti di N giorni da oggi.
    if (nuovoStato && terapia.frequenza === "intervallo" && terapia.intervallo_giorni) {
      await avanzaProssimaDose(terapia.id, terapia.intervallo_giorni);
      caricaTutto();
    }
  }

  // Ordina per orario più presto (prima terapia della giornata in cima), sia attive che in pausa.
  function primoOrarioDi(t) {
    return orariDosiDi(t)[0]?.orario || "99:99"; // senza orario finisce in fondo
  }
  const terapieOrdinate = [...terapie].sort((a, b) => primoOrarioDi(a).localeCompare(primoOrarioDi(b)));
  const terapieAttive = terapieOrdinate.filter((t) => t.attiva);
  const terapiePausa = terapieOrdinate.filter((t) => !t.attiva);

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <AcPepeHeader />
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Terapie</h1>

      {/* Checklist di oggi: una card per terapia, con gli orari (e dosi) affiancati dentro */}
      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Da fare oggi</h2>
      <div className="flex flex-col gap-2 mb-6">
        {terapieAttive.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna terapia attiva impostata.</p>
        )}
        {terapieAttive
          .filter((t) => t.frequenza !== "intervallo" || !t.prossima_dose || t.prossima_dose <= oggiISO())
          .map((t) => {
          const od = orariDosiDi(t);
          return (
            <div key={t.id} className={`${GLASS} rounded-2xl px-4 py-3`}>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>
                {t.nome}
                {t.frequenza === "intervallo" && (
                  <span className="text-xs font-normal ml-2 opacity-70">· ogni {t.intervallo_giorni} giorni</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {od.map(({ orario, dose }) => {
                  const chiave = `${t.id}__${orario}`;
                  const fatto = !!fatte[chiave];
                  return (
                    <button
                      key={chiave}
                      onClick={() => handleSpunta(t, orario)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition"
                      style={fatto ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
                    >
                      {fatto && <Check size={13} strokeWidth={3} />}
                      {orario || "senza orario"}{dose ? ` · ${dose}` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
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

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Frequenza</label>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setNuova((prev) => ({ ...prev, frequenza: "giornaliera" }))}
            className="flex-1 py-2 rounded-xl text-sm"
            style={nuova.frequenza === "giornaliera" ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            Ogni giorno
          </button>
          <button
            onClick={() => setNuova((prev) => ({ ...prev, frequenza: "intervallo" }))}
            className="flex-1 py-2 rounded-xl text-sm"
            style={nuova.frequenza === "intervallo" ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            A intervalli
          </button>
        </div>

        {nuova.frequenza === "giornaliera" ? (
          <>
            <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>
              Orari e dose (fino a 3 volte al giorno — puoi mettere dosi diverse per ogni orario)
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="time"
                value={nuova.orario1}
                onChange={(e) => setNuova((prev) => ({ ...prev, orario1: e.target.value }))}
                className="flex-1 rounded-xl px-2 py-2 text-sm"
                style={{ background: "#fff" }}
              />
              <input
                value={nuova.dose1}
                onChange={(e) => setNuova((prev) => ({ ...prev, dose1: e.target.value }))}
                placeholder="dose"
                className="flex-1 rounded-xl px-2 py-2 text-sm"
                style={{ background: "#fff" }}
              />
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="time"
                value={nuova.orario2}
                onChange={(e) => setNuova((prev) => ({ ...prev, orario2: e.target.value }))}
                className="flex-1 rounded-xl px-2 py-2 text-sm"
                style={{ background: "#fff" }}
              />
              <input
                value={nuova.dose2}
                onChange={(e) => setNuova((prev) => ({ ...prev, dose2: e.target.value }))}
                placeholder="dose"
                className="flex-1 rounded-xl px-2 py-2 text-sm"
                style={{ background: "#fff" }}
              />
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="time"
                value={nuova.orario3}
                onChange={(e) => setNuova((prev) => ({ ...prev, orario3: e.target.value }))}
                className="flex-1 rounded-xl px-2 py-2 text-sm"
                style={{ background: "#fff" }}
              />
              <input
                value={nuova.dose3}
                onChange={(e) => setNuova((prev) => ({ ...prev, dose3: e.target.value }))}
                placeholder="dose"
                className="flex-1 rounded-xl px-2 py-2 text-sm"
                style={{ background: "#fff" }}
              />
            </div>
          </>
        ) : (
          <>
            <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Ogni quanti giorni (es. 72 ore = 3 giorni)</label>
            <input
              type="number"
              min="1"
              value={nuova.intervalloGiorni}
              onChange={(e) => setNuova((prev) => ({ ...prev, intervalloGiorni: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm mb-3 font-mono-num"
              style={{ background: "#fff" }}
            />

            <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Prossima dose (data)</label>
            <input
              type="date"
              value={nuova.prossimaDose}
              onChange={(e) => setNuova((prev) => ({ ...prev, prossimaDose: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm mb-3"
              style={{ background: "#fff" }}
            />

            <div className="flex gap-2 mb-3">
              <input
                type="time"
                value={nuova.oraIntervallo}
                onChange={(e) => setNuova((prev) => ({ ...prev, oraIntervallo: e.target.value }))}
                className="flex-1 rounded-xl px-2 py-2 text-sm"
                style={{ background: "#fff" }}
              />
              <input
                value={nuova.doseIntervallo}
                onChange={(e) => setNuova((prev) => ({ ...prev, doseIntervallo: e.target.value }))}
                placeholder="dose"
                className="flex-1 rounded-xl px-2 py-2 text-sm"
                style={{ background: "#fff" }}
              />
            </div>
            <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
              Comparirà nella checklist solo dal giorno della prossima dose in poi. Quando la spunti, la prossima si ricalcola da sola in avanti di {nuova.intervalloGiorni || "N"} giorni.
            </p>
          </>
        )}

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
        {terapieAttive.map((t) => {
          const od = orariDosiDi(t);
          return (
            <div key={t.id} className={`${GLASS} rounded-2xl px-4 py-3`} style={{ outline: editingId === t.id ? "2px solid rgba(255,255,255,0.6)" : "none" }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#fff" }}>{t.nome}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {t.frequenza === "intervallo"
                      ? `ogni ${t.intervallo_giorni} giorni · prossima il ${t.prossima_dose}${od[0]?.dose ? ` · ${od[0].dose}` : ""}`
                      : od.map(({ orario, dose }) => `${orario || "—"}${dose ? ` (${dose})` : ""}`).join(" · ")}
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
          );
        })}

        {terapiePausa.length > 0 && (
          <>
            <p className="text-xs mt-3 mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>In pausa</p>
            {terapiePausa.map((t) => (
              <div key={t.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`} style={{ opacity: 0.6 }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#fff" }}>{t.nome}</p>
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
