import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Home as HomeIcon, Car, Bike } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { getCategorie, creaCategoria, getSpese, creaSpesa, eliminaSpesa, caricaFotoScontrino, getTotaleGenerale } from "../../lib/acHome";

const GRUPPI = [
  { id: "casa", label: "Casa", icon: HomeIcon },
  { id: "auto", label: "Auto", icon: Car },
  { id: "scooter", label: "Scooter", icon: Bike },
];

const oggi = new Date();
const MESE_CORRENTE = oggi.getMonth() + 1;
const ANNO_CORRENTE = oggi.getFullYear();
const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";

export default function AcHomeSpese() {
  const [searchParams] = useSearchParams();
  const [gruppo, setGruppo] = useState(searchParams.get("gruppo") || "casa");
  const [categorie, setCategorie] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [nuovaCategoria, setNuovaCategoria] = useState("");
  const [importo, setImporto] = useState("");
  const [data, setData] = useState(() => oggi.toISOString().slice(0, 10));
  const [nota, setNota] = useState("");
  const [foto, setFoto] = useState(null);
  const [spese, setSpese] = useState([]);
  const [totaleGenerale, setTotaleGenerale] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState(null);

  useEffect(() => {
    caricaCategorie();
    caricaSpese();
    caricaTotaleGenerale();
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

  async function caricaTotaleGenerale() {
    const tot = await getTotaleGenerale(gruppo);
    setTotaleGenerale(tot);
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
      if (foto) foto_url = await caricaFotoScontrino(foto);
      await creaSpesa({ categoria_id: categoriaId, importo: parseFloat(importo), data, nota, foto_url });
      setImporto("");
      setNota("");
      setFoto(null);
      caricaSpese();
      caricaTotaleGenerale();
    } catch (err) {
      setErrore("Errore nel salvataggio: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleElimina(id) {
    await eliminaSpesa(id);
    caricaSpese();
    caricaTotaleGenerale();
  }

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Spese</h1>

      <div className="flex gap-2 mb-5">
        {GRUPPI.map((g) => {
          const Icon = g.icon;
          const attivo = gruppo === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setGruppo(g.id)}
              className="flex-1 py-2 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5"
              style={attivo ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              <Icon size={16} /> {g.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSalva} className={`${GLASS} rounded-3xl p-4 mb-5`}>
        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Sottocategoria</label>
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
          <button type="button" onClick={handleNuovaCategoria} className="px-3 rounded-xl text-sm font-display" style={{ background: T.forest, color: "#fff" }}>
            +
          </button>
        </div>

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Importo (€)</label>
        <input
          type="number"
          step="0.01"
          value={importo}
          onChange={(e) => setImporto(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3 font-mono-num"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Nota (opzionale)</label>
        <input
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="es. tagliando scooter"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Foto scontrino (opzionale)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
          className="w-full text-sm mb-3"
          style={{ color: "#fff" }}
        />

        {errore && <p className="text-xs text-red-100 mb-2">{errore}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="w-full py-2.5 rounded-xl font-display text-sm"
          style={{ background: T.forest, color: "#fff", opacity: salvando ? 0.6 : 1 }}
        >
          {salvando ? "Salvo..." : "Salva spesa"}
        </button>
      </form>

      <div className={`${GLASS} rounded-2xl p-4 mb-4 flex justify-between`}>
        <div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Totale mese</p>
          <p className="font-mono-num text-lg" style={{ color: "#fff" }}>
            € {spese.reduce((tot, s) => tot + Number(s.importo), 0).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Totale generale</p>
          <p className="font-mono-num text-lg" style={{ color: "#fff" }}>€ {totaleGenerale.toFixed(2)}</p>
        </div>
      </div>

      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>Spese di questo mese</h2>
      <div className="flex flex-col gap-2">
        {spese.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessuna spesa registrata.</p>}
        {spese.map((s) => (
          <div key={s.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>
                {s.ac_home_categorie?.nome || "—"} {s.ricorrente_id && <span className="text-xs opacity-70">· ricorrente</span>}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{s.data} {s.nota ? `· ${s.nota}` : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-mono-num font-semibold" style={{ color: "#fff" }}>€ {Number(s.importo).toFixed(2)}</p>
              <button onClick={() => handleElimina(s.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(224,82,82,0.35)", color: "#fff" }}>
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
