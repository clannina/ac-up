import { useEffect, useState } from "react";
import { Home as HomeIcon, Car, Bike, HeartPulse } from "lucide-react";
import { T, GLASS } from "../../lib/theme";
import { getCategorie, getSpese, getBudget, impostaBudget } from "../../lib/acHome";

const GRUPPI = [
  { id: "casa", label: "Casa", icon: HomeIcon },
  { id: "auto", label: "Auto", icon: Car },
  { id: "scooter", label: "Scooter", icon: Bike },
  { id: "mediche", label: "Spese mediche", icon: HeartPulse },
];

const oggi = new Date();
const MESE_CORRENTE = oggi.getMonth() + 1;
const ANNO_CORRENTE = oggi.getFullYear();
const BACKGROUND = "linear-gradient(180deg, #0DAE8C 0%, #1A7FA3 55%, #5FA8DC 100%)";

export default function AcHomeBudget() {
  const [gruppo, setGruppo] = useState("casa");
  const [categorie, setCategorie] = useState([]);
  const [spese, setSpese] = useState([]);
  const [budget, setBudget] = useState([]);
  const [budgetInput, setBudgetInput] = useState({});

  useEffect(() => {
    caricaCategorie();
    caricaSpese();
    caricaBudget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gruppo]);

  async function caricaCategorie() {
    setCategorie(await getCategorie(gruppo));
  }

  async function caricaSpese() {
    setSpese(await getSpese({ mese: MESE_CORRENTE, anno: ANNO_CORRENTE, gruppo }));
  }

  async function caricaBudget() {
    const lista = await getBudget(MESE_CORRENTE, ANNO_CORRENTE);
    setBudget(lista.filter((b) => b.ac_home_categorie?.gruppo === gruppo));
  }

  async function handleSalvaBudget(categoria_id) {
    const valore = parseFloat(budgetInput[categoria_id]);
    if (!valore && valore !== 0) return;
    await impostaBudget({ categoria_id, mese: MESE_CORRENTE, anno: ANNO_CORRENTE, importo: valore });
    caricaBudget();
  }

  function totaleSpesoCategoria(categoria_id) {
    return spese.filter((s) => s.categoria_id === categoria_id).reduce((tot, s) => tot + Number(s.importo), 0);
  }

  return (
    <div className="min-h-screen pb-28 px-4 pt-6" style={{ background: BACKGROUND }}>
      <h1 className="font-display text-2xl mb-4" style={{ color: "#fff" }}>Budget</h1>

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

      <div className={`${GLASS} rounded-2xl p-4 mb-4 flex justify-between`}>
        <div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Speso questo mese</p>
          <p className="font-mono-num text-lg" style={{ color: "#fff" }}>
            € {spese.reduce((tot, s) => tot + Number(s.importo), 0).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Budget totale mese</p>
          <p className="font-mono-num text-lg" style={{ color: "#fff" }}>
            € {budget.reduce((tot, b) => tot + Number(b.importo), 0).toFixed(2)}
          </p>
        </div>
      </div>

      <h2 className="font-display text-sm mb-2" style={{ color: "#fff" }}>
        Budget di {oggi.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
      </h2>
      <div className="flex flex-col gap-3">
        {categorie.length === 0 && <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Crea prima una sottocategoria nella pagina Spese.</p>}
        {categorie.map((c) => {
          const budgetRiga = budget.find((b) => b.categoria_id === c.id);
          const speso = totaleSpesoCategoria(c.id);
          const importoBudget = budgetRiga?.importo || 0;
          const percentuale = importoBudget > 0 ? Math.min(100, (speso / importoBudget) * 100) : 0;
          const sforato = importoBudget > 0 && speso > importoBudget;

          return (
            <div key={c.id} className={`${GLASS} rounded-2xl p-4`}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium" style={{ color: "#fff" }}>{c.nome}</p>
                <p className="text-xs font-mono-num" style={{ color: "rgba(255,255,255,0.85)" }}>
                  € {speso.toFixed(2)} {importoBudget > 0 && `/ € ${Number(importoBudget).toFixed(2)}`}
                </p>
              </div>

              {importoBudget > 0 && (
                <div className="w-full h-2 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${percentuale}%`, background: sforato ? "#e05252" : "#fff" }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Imposta budget mensile..."
                  value={budgetInput[c.id] ?? ""}
                  onChange={(e) => setBudgetInput((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  className="flex-1 rounded-xl px-3 py-2 text-sm font-mono-num"
                  style={{ background: "#fff" }}
                />
                <button
                  onClick={() => handleSalvaBudget(c.id)}
                  className="px-3 rounded-xl text-sm font-display"
                  style={{ background: T.forest, color: "#fff" }}
                >
                  Salva
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
