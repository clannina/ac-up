import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Car, Bike, Trash2, TrendingUp, Pencil } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { getVeicoli, creaVeicolo, aggiornaVeicolo, eliminaVeicolo } from "../../lib/acHome";
import AcHomeHeader from "../../components/AcHomeHeader.jsx";

const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";
const VUOTO = { nome: "", targa: "", tipo: "auto" };

export default function AcHomeProfilo() {
  const [veicoli, setVeicoli] = useState([]);
  const [nuovo, setNuovo] = useState(VUOTO);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    caricaVeicoli();
  }, []);

  async function caricaVeicoli() {
    setVeicoli(await getVeicoli());
  }

  function handleModifica(v) {
    setEditingId(v.id);
    setNuovo({ nome: v.nome, targa: v.targa || "", tipo: v.tipo });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function annullaModifica() {
    setEditingId(null);
    setNuovo(VUOTO);
  }

  async function handleNuovo() {
    if (!nuovo.nome.trim()) return;
    if (editingId) {
      await aggiornaVeicolo(editingId, nuovo);
      setEditingId(null);
    } else {
      await creaVeicolo(nuovo);
    }
    setNuovo(VUOTO);
    caricaVeicoli();
  }

  async function handleElimina(id) {
    await eliminaVeicolo(id);
    if (editingId === id) annullaModifica();
    caricaVeicoli();
  }

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <AcHomeHeader />
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Profilo</h1>

      <Link to="/ac-home/storico" className={`${GLASS} flex items-center gap-3 rounded-3xl p-4 mb-6`}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#fff" }}>
          <TrendingUp size={20} color={T.forest} />
        </div>
        <div>
          <p className="font-display text-base" style={{ color: "#fff" }}>Storico e bilancio</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Andamento mensile, categorie e riepilogo annuale</p>
        </div>
      </Link>

      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>I tuoi mezzi</h2>
      <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
        Collega un veicolo a una scadenza (es. revisione, bollo) per tenerne traccia nel tempo.
      </p>

      <div className={`${GLASS} rounded-3xl p-4 mb-6`}>
        {editingId && (
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-display" style={{ color: "#fff" }}>Stai modificando un veicolo</p>
            <button onClick={annullaModifica} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              Annulla
            </button>
          </div>
        )}

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Nome</label>
        <input
          value={nuovo.nome}
          onChange={(e) => setNuovo((prev) => ({ ...prev, nome: e.target.value }))}
          placeholder="es. Panda, Vespa..."
          className="w-full rounded-xl px-3 py-2 text-sm mb-3"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Targa (opzionale)</label>
        <input
          value={nuovo.targa}
          onChange={(e) => setNuovo((prev) => ({ ...prev, targa: e.target.value.toUpperCase() }))}
          placeholder="es. AB123CD"
          className="w-full rounded-xl px-3 py-2 text-sm mb-3 font-mono-num"
          style={{ background: "#fff" }}
        />

        <label className="block text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Tipo</label>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setNuovo((prev) => ({ ...prev, tipo: "auto" }))}
            className="flex-1 py-2 rounded-xl text-sm flex items-center justify-center gap-1.5"
            style={nuovo.tipo === "auto" ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            <Car size={16} /> Auto
          </button>
          <button
            onClick={() => setNuovo((prev) => ({ ...prev, tipo: "scooter" }))}
            className="flex-1 py-2 rounded-xl text-sm flex items-center justify-center gap-1.5"
            style={nuovo.tipo === "scooter" ? { background: "#fff", color: T.forest } : { background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            <Bike size={16} /> Scooter
          </button>
        </div>

        <button onClick={handleNuovo} className="w-full py-2.5 rounded-xl font-display text-sm" style={{ background: T.forest, color: "#fff" }}>
          {editingId ? "Aggiorna veicolo" : "Aggiungi veicolo"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {veicoli.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Nessun veicolo aggiunto.</p>}
        {veicoli.map((v) => {
          const Icon = v.tipo === "scooter" ? Bike : Car;
          return (
            <div key={v.id} className={`${GLASS} rounded-2xl px-4 py-3 flex justify-between items-center`} style={{ outline: editingId === v.id ? "2px solid rgba(255,255,255,0.6)" : "none" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#fff" }}>
                  <Icon size={18} color={T.forest} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#fff" }}>{v.nome}</p>
                  {v.targa && <p className="text-xs font-mono-num" style={{ color: "rgba(255,255,255,0.65)" }}>{v.targa}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleModifica(v)} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <Pencil size={16} color="#fff" />
                </button>
                <button onClick={() => handleElimina(v.id)} className="p-2 rounded-lg" style={{ background: "rgba(224,82,82,0.35)" }}>
                  <Trash2 size={16} color="#fff" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
