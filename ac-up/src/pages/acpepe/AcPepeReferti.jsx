import { useEffect, useMemo, useState } from "react";
import { FileText, Upload, Trash2, ExternalLink, Loader2, Pencil, X } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import AcPepeHeader from "../../components/AcPepeHeader.jsx";
import { getReferti, creaReferto, creaRefertoLink, aggiornaReferto, eliminaReferto } from "../../lib/acPepe";

const BACKGROUND = "linear-gradient(180deg, #F5C518 0%, #E9311A 100%)";

const TIPI_BASE = [
  { id: "esami", label: "Esami" },
  { id: "ecocardiogramma", label: "Ecocardio" },
  { id: "radiografia", label: "Radiografia" },
  { id: "visita", label: "Visita" },
  { id: "altro", label: "Altro" },
];

const VUOTO = { titolo: "", tipo: "altro", data: new Date().toISOString().slice(0, 10), note: "" };

export default function AcPepeReferti() {
  const [referti, setReferti] = useState([]);
  const [caricato, setCaricato] = useState(false);
  const [filtro, setFiltro] = useState("tutti");
  const [nuovo, setNuovo] = useState(VUOTO);
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [modalitaOrigine, setModalitaOrigine] = useState("file"); // "file" | "link"
  const [editingId, setEditingId] = useState(null);
  const [editingPercorso, setEditingPercorso] = useState(null);
  const [caricando, setCaricando] = useState(false);
  const [errore, setErrore] = useState(null);
  const [mostraNuovaCategoria, setMostraNuovaCategoria] = useState(false);
  const [nuovaCategoriaTesto, setNuovaCategoriaTesto] = useState("");
  const [categorieExtra, setCategorieExtra] = useState([]); // categorie appena create, non ancora presenti in nessun referto

  useEffect(() => {
    caricaReferti();
  }, []);

  async function caricaReferti() {
    const dati = await getReferti();
    setReferti(dati);
    setCaricato(true);
  }

  // Categorie disponibili nel menu: quelle base + quelle già usate nei referti + quelle appena create.
  const tipiDisponibili = useMemo(() => {
    const daiReferti = referti.map((r) => r.tipo).filter(Boolean);
    const tuttiIds = new Set([...TIPI_BASE.map((t) => t.id), ...daiReferti, ...categorieExtra]);
    return Array.from(tuttiIds);
  }, [referti, categorieExtra]);

  function labelTipo(tipoId) {
    return TIPI_BASE.find((t) => t.id === tipoId)?.label || tipoId;
  }

  function handleModifica(r) {
    setEditingId(r.id);
    setEditingPercorso(r.file_percorso);
    setNuovo({ titolo: r.titolo, tipo: r.tipo, data: r.data, note: r.note || "" });
    setFile(null);
    setLink("");
    setModalitaOrigine("file");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function confermaNuovaCategoria() {
    const valore = nuovaCategoriaTesto.trim().toLowerCase().replace(/\s+/g, "_");
    if (!valore) return;
    setCategorieExtra((prev) => Array.from(new Set([...prev, valore])));
    setNuovo((prev) => ({ ...prev, tipo: valore }));
    setNuovaCategoriaTesto("");
    setMostraNuovaCategoria(false);
  }

  function annullaModifica() {
    setEditingId(null);
    setEditingPercorso(null);
    setNuovo(VUOTO);
    setFile(null);
    setLink("");
    setErrore(null);
  }

  async function handleCarica() {
    setErrore(null);
    if (!nuovo.titolo.trim()) {
      setErrore("Serve almeno un titolo.");
      return;
    }
    if (!editingId && modalitaOrigine === "file" && !file) {
      setErrore("Seleziona un file.");
      return;
    }
    if (!editingId && modalitaOrigine === "link" && !link.trim()) {
      setErrore("Incolla un link.");
      return;
    }

    setCaricando(true);
    try {
      if (editingId) {
        await aggiornaReferto(editingId, { ...nuovo, file, vecchioPercorso: editingPercorso });
      } else if (modalitaOrigine === "file") {
        await creaReferto({ ...nuovo, file });
      } else {
        await creaRefertoLink({ ...nuovo, link: link.trim() });
      }
      annullaModifica();
      caricaReferti();
    } catch (err) {
      setErrore(err.message);
    }
    setCaricando(false);
  }

  async function handleElimina(referto) {
    await eliminaReferto(referto.id, referto.file_percorso);
    if (editingId === referto.id) annullaModifica();
    caricaReferti();
  }

  const filtrati = filtro === "tutti" ? referti : referti.filter((r) => r.tipo === filtro);
  const tipiPresenti = useMemo(() => Array.from(new Set(referti.map((r) => r.tipo).filter(Boolean))), [referti]);

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <AcPepeHeader />
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Referti</h1>

      {/* Form nuovo / modifica referto */}
      <div className={`${GLASS} rounded-3xl p-4 mb-6`}>
        {editingId && (
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-display" style={{ color: "#fff" }}>Stai modificando un referto</p>
            <button onClick={annullaModifica} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              Annulla
            </button>
          </div>
        )}

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Titolo</label>
        <input
          value={nuovo.titolo}
          onChange={(e) => setNuovo((prev) => ({ ...prev, titolo: e.target.value }))}
          placeholder="es. Ecocardiogramma di controllo"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Categoria</label>
        <select
          value={mostraNuovaCategoria ? "__nuova__" : nuovo.tipo}
          onChange={(e) => {
            if (e.target.value === "__nuova__") {
              setMostraNuovaCategoria(true);
            } else {
              setMostraNuovaCategoria(false);
              setNuovo((prev) => ({ ...prev, tipo: e.target.value }));
            }
          }}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        >
          {tipiDisponibili.map((t) => (
            <option key={t} value={t}>{labelTipo(t)}</option>
          ))}
          <option value="__nuova__">+ Nuova categoria</option>
        </select>

        {mostraNuovaCategoria && (
          <div className="flex gap-2 mb-3">
            <input
              value={nuovaCategoriaTesto}
              onChange={(e) => setNuovaCategoriaTesto(e.target.value)}
              placeholder="Nome nuova categoria"
              className="flex-1 rounded-xl px-3 py-2 text-sm"
              style={{ background: "#fff" }}
              autoFocus
            />
            <button
              onClick={confermaNuovaCategoria}
              className="px-4 rounded-xl text-sm font-display"
              style={{ background: T.forest, color: "#fff" }}
            >
              Aggiungi
            </button>
          </div>
        )}

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Data</label>
        <input
          type="date"
          value={nuovo.data}
          onChange={(e) => setNuovo((prev) => ({ ...prev, data: e.target.value }))}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Note (opzionale)</label>
        <input
          value={nuovo.note}
          onChange={(e) => setNuovo((prev) => ({ ...prev, note: e.target.value }))}
          placeholder="es. valori nella norma"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        {!editingId && (
          <>
            <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Origine del file</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setModalitaOrigine("file")}
                className="flex-1 py-2 rounded-xl text-sm"
                style={modalitaOrigine === "file" ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                Carica file
              </button>
              <button
                onClick={() => setModalitaOrigine("link")}
                className="flex-1 py-2 rounded-xl text-sm"
                style={modalitaOrigine === "link" ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                Incolla link Drive
              </button>
            </div>
          </>
        )}

        {(editingId || modalitaOrigine === "file") && (
          <>
            <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>
              {editingId ? "Sostituisci file (opzionale)" : "File (PDF o foto)"}
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl px-3 py-2 text-xs mb-3"
              style={{ background: "#fff" }}
            />
          </>
        )}

        {!editingId && modalitaOrigine === "link" && (
          <>
            <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Link Google Drive</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-xl px-3 py-2 text-sm mb-1"
              style={{ background: "#fff" }}
            />
            <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
              Su Drive: apri il file → Condividi → Copia link. Assicurati sia impostato su "Chiunque abbia il link".
            </p>
          </>
        )}

        {errore && (
          <div className="text-sm rounded-xl p-3 bg-white mb-3" style={{ color: T.coral }}>
            {errore}
          </div>
        )}

        <button
          onClick={handleCarica}
          disabled={caricando}
          className="w-full py-2.5 rounded-xl font-display text-sm flex items-center justify-center gap-2"
          style={{ background: T.forest, color: "#fff" }}
        >
          {caricando ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {caricando ? "Salvo..." : editingId ? "Aggiorna referto" : "Carica referto"}
        </button>
      </div>

      {/* Filtro per categoria */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFiltro("tutti")}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
          style={filtro === "tutti" ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
        >
          Tutti
        </button>
        {tipiPresenti.map((t) => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={filtro === t ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            {labelTipo(t)}
          </button>
        ))}
      </div>

      {/* Elenco referti */}
      <div className="flex flex-col gap-2">
        {caricato && filtrati.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessun referto caricato.</p>
        )}
        {filtrati.map((r) => (
          <div key={r.id} className={`${GLASS} rounded-2xl px-4 py-3`} style={{ outline: editingId === r.id ? "2px solid rgba(255,255,255,0.6)" : "none" }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#fff" }}>
                <FileText size={17} color={T.forest} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "#fff" }}>{r.titolo}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {r.data} · {labelTipo(r.tipo)}
                  {r.note ? ` · ${r.note}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
              <a
                href={r.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                <ExternalLink size={13} /> Apri
              </a>
              <button onClick={() => handleModifica(r)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                <Pencil size={13} /> Modifica
              </button>
              <button onClick={() => handleElimina(r)} className="p-1.5 rounded-lg" style={{ background: "rgba(224,82,82,0.35)" }}>
                <Trash2 size={14} color="#fff" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
