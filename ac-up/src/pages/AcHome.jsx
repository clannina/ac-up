import { useEffect, useState } from "react";
import { T } from "../lib/theme";
import {
  getCategorie,
  creaCategoria,
  getSpese,
  creaSpesa,
  caricaFotoScontrino,
} from "../lib/acHome";

const GRUPPI = [
  { id: "casa", label: "Casa", emoji: "🏠" },
  { id: "auto", label: "Auto", emoji: "🚗" },
  { id: "scooter", label: "Scooter", emoji: "🛵" },
];

export default function AcHome() {
  const [gruppo, setGruppo] = useState("casa");
  const [categorie, setCategorie] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [nuovaCategoria, setNuovaCategoria] = useState("");
  const [importo, setImporto] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [nota, setNota] = useState("");
  const [foto, setFoto] = useState(null);
  const [spese, setSpese] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState(null);

  useEffect(() => {
    caricaCategorie();
    caricaSpese();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gruppo]);

  async function caricaCategorie() {
    const cats = await getCategorie(gruppo);
    setCategorie(cats);
    setCategoriaId(cats[0]?.id || "");
  }

  async function caricaSpese() {
    const oggi = new Date();
    const lista = await getSpese({ mese: oggi.getMonth() + 1, anno: oggi.getFullYear(), gruppo });
    setSpese(lista);
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
      if (foto) {
        foto_url = await caricaFotoScontrino(foto);
      }
      await creaSpesa({ categoria_id: categoriaId, importo: parseFloat(importo), data, nota, foto_url });
      setImporto("");
      setNota("");
      setFoto(null);
      caricaSpese();
    } catch (err) {
      setErrore("Errore nel salvataggio: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" style={{ background: T.paper, color: T.stone }}>
      <h1 className="text-2xl font-bold mb-4">AC Home</h1>

      {/* Selettore gruppo */}
      <div className="flex gap-2 mb-5">
        {GRUPPI.map((g) => (
          <button
            key={g.id}
            onClick={() => setGruppo(g.id)}
            className="flex-1 py-2 rounded-2xl text-sm font-medium transition-colors"
            style={
              gruppo === g.id
                ? { background: T.forest, color: "#fff" }
                : { background: "rgba(0,0,0,0.05)", color: T.stone }
            }
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      {/* Form nuova spesa */}
      <form onSubmit={handleSalva} className="rounded-3xl p-4 mb-6" style={{ background: "rgba(0,0,0,0.03)" }}>
        <label className="block text-xs opacity-60 mb-1">Sottocategoria</label>
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
          <button type="button" onClick={handleNuovaCategoria} className="px-3 rounded-xl text-sm" style={{ background: T.forest, color: "#fff" }}>
            +
          </button>
        </div>

        <label className="block text-xs opacity-60 mb-1">Importo (€)</label>
        <input
          type="number"
          step="0.01"
          value={importo}
          onChange={(e) => setImporto(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs opacity-60 mb-1">Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs opacity-60 mb-1">Nota (opzionale)</label>
        <input
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="es. tagliando scooter"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs opacity-60 mb-1">Foto scontrino (opzionale)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
          className="w-full text-sm mb-3"
        />

        {errore && <p className="text-xs text-red-600 mb-2">{errore}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="w-full py-2.5 rounded-xl font-medium text-sm"
          style={{ background: T.forest, color: "#fff", opacity: salvando ? 0.6 : 1 }}
        >
          {salvando ? "Salvo..." : "Salva spesa"}
        </button>
      </form>

      {/* Lista spese del mese */}
      <h2 className="text-sm font-semibold mb-2 opacity-70">Spese di questo mese</h2>
      <div className="flex flex-col gap-2">
        {spese.length === 0 && <p className="text-sm opacity-50">Nessuna spesa registrata.</p>}
        {spese.map((s) => (
          <div key={s.id} className="rounded-2xl px-4 py-3 flex justify-between items-center" style={{ background: "rgba(0,0,0,0.03)" }}>
            <div>
              <p className="text-sm font-medium">{s.ac_home_categorie?.nome || "—"}</p>
              <p className="text-xs opacity-50">{s.data} {s.nota ? `· ${s.nota}` : ""}</p>
            </div>
            <p className="font-mono font-semibold">€ {Number(s.importo).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
