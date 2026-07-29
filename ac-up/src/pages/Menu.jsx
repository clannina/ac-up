import { useState, useMemo } from "react";
import { Search, Plus, Filter, Clock } from "lucide-react";
import { T, GLASS } from "../lib/theme";
import { Page, SectionTitle, PrimaryButton } from "../components/ui";

const meals = [
  { id: 1, name: "Colazione", calories: 320, protein: 22, carbs: 30, fat: 10, time: "06:30" },
  { id: 2, name: "Spuntino", calories: 180, protein: 15, carbs: 18, fat: 5, time: "10:30" },
  { id: 3, name: "Pranzo", calories: 640, protein: 42, carbs: 65, fat: 18, time: "13:00" },
  { id: 4, name: "Merenda", calories: 170, protein: 10, carbs: 20, fat: 6, time: "17:00" },
  { id: 5, name: "Cena", calories: 560, protein: 38, carbs: 40, fat: 20, time: "20:00" },
];

function Macro({ label, value, color }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono-num font-bold text-lg" style={{ color }}>{value}g</span>
      <span className="text-xs" style={{ color: T.stone }}>{label}</span>
    </div>
  );
}

function MealCard({ meal }) {
  return (
    <div className={`${GLASS} rounded-2xl p-6 transition hover:bg-white/75`}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold" style={{ color: T.ink }}>{meal.name}</h2>
          <p className="text-sm flex items-center gap-1 mt-1" style={{ color: T.stone }}>
            <Clock size={13} /> <span className="font-mono-num">{meal.time}</span>
          </p>
        </div>
        <div className="px-3 py-1 rounded-full font-semibold font-mono-num text-sm" style={{ background: `${T.sage}22`, color: T.forest }}>
          {meal.calories} kcal
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <Macro label="Proteine" value={meal.protein} color={T.protein} />
        <Macro label="Carbo" value={meal.carbs} color={T.carbs} />
        <Macro label="Grassi" value={meal.fat} color={T.fat} />
      </div>

      <button
        className="w-full mt-6 rounded-xl py-3 font-semibold transition"
        style={{ border: `1px solid ${T.mist}`, color: T.ink }}
      >
        Modifica pasto
      </button>
    </div>
  );
}

export default function Menu() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => meals.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <Page>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
        <div>
          <SectionTitle className="text-3xl">Piano Alimentare</SectionTitle>
          <p className="mt-2" style={{ color: T.stone }}>Gestisci tutti i pasti della giornata.</p>
        </div>

        <PrimaryButton className="flex items-center gap-2">
          <Plus size={18} /> Nuovo pasto
        </PrimaryButton>
      </div>

      <div className={`${GLASS} rounded-2xl mt-8 p-5 flex flex-col md:flex-row gap-4`}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3" style={{ color: T.stone }} size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca un pasto..."
            className="pl-11 pr-4 py-3 rounded-xl w-full outline-none bg-white/70"
            style={{ border: `1px solid ${T.mist}` }}
          />
        </div>

        <button
          className="rounded-xl px-5 flex items-center justify-center gap-2 transition hover:bg-white/50"
          style={{ border: `1px solid ${T.mist}`, color: T.ink }}
        >
          <Filter size={18} /> Filtri
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {filtered.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </Page>
  );
}
